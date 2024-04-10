// OnlineShopLink.js
import React from 'react';

import { useState,useEffect } from 'react';
import Modal from './Modal';
import io from 'socket.io-client';
import axios from "axios"


const OnlineShop = () => {
    const ENDPOINT = "https://www.dowellchat.uxlivinglab.online"
    const [socket, setSocket] = useState(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [messageText, setMessageText] = useState("");
    const[messages,setMessages]=useState([])
    const [ticketId, setTicketId] = useState(null)
    const [userId, setUserId] = useState(null)
    const [productName, setProductName] = useState("test_product")
    const [link, setLink] = useState("");
    const[linkId,setLinkId]=useState(null)
    const[orderId,setOrderId]=useState(null)


  const queryParams = new URLSearchParams(window.location.search);
  const workspaceId = queryParams.get('workspace_id');
  const storeId = queryParams.get('store_id');
 
//   localStorage.removeItem("ticketId")
//   localStorage.removeItem("userId")
// localStorage.removeItem("orderId")
 //check get all messages
  useEffect(() => {
   const getResponse=async()=>{//ticket_link is not present in api
        try {
            const response = await fetch(`https://www.q.uxlivinglab.online/api/v3/user-services/?type=retrieve_user&workspace_id=${workspaceId}`,{
                method:"GET",
                headers:{
                    "Authorization":`Bearer 1af585c9-bf49-4f35-992a-26842de6bd00`
                }
            });
            const data = await response.json();
            if (data && data.response && data.response[0] && data.response[0].ticket_link) {
                setLink(data.response[0].ticket_link);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    getResponse();
}, []);


useEffect(() => {
    const useQueryParams = () => {
        if (!link) {
            console.log("Link is empty");
            return null;
        }

        try {
           
            return new URLSearchParams(new URL(link).search);
        } catch (error) {
            console.error("Error constructing URL:", error);
            return null;
        }
    };
    const queryParams = useQueryParams();
    if (queryParams) {  
        const link_id = queryParams.get("link_id");
        setLinkId(link_id)
    }
}, [link]);

const getOrderId=async(ticketId,orderId)=>{

    let body={
            workspace_id:"6385c0f18eca0fb652c94558",//this is present in api of v3
            date:"2024_02_29",
            timezone:"Asia/Calcutta",
            store_id:"660d7c76668a02ef5b274215",
            ticket_id:ticketId,
            customer_user_id:orderId 
    }
    
    const response = await axios.post(
        "https://www.q.uxlivinglab.online/api/v3/online-store-customer-services/?type=initiate_online_order",
        body, 
        {
            headers: {
                "Authorization": `Bearer 1af585c9-bf49-4f35-992a-26842de6bd00`
            }
        })
        localStorage.setItem("orderId",response.data.response)
        setOrderId(response.data.response)
}

useEffect(() => {
    const newSocket = io(ENDPOINT);
    setSocket(newSocket);
    return () => {
        newSocket.disconnect();
    };
}, []);


useEffect(()=>{
    let storedTicketId=localStorage.getItem("ticketId")
    let storeduserId=localStorage.getItem("userId")
    let storedorderId=localStorage.getItem("orderId")
        setTicketId(storedTicketId)
        setUserId(storeduserId)
        setOrderId(storedorderId)
  },[])


  const handleMessageResponse=()=>{
    if (socket) {
        getAllMessages()
        const handleMessage= (res) => {
            if(res.operation=="get_ticket_messages"){
               
               setMessages(res.data)
            }else{
                setMessages((prev)=>[...prev,res.data])
            }
        };
        socket.on('ticket_message_response', handleMessage);
  }else{
    console.log("socket not connected")
  }
}

const createTicket=()=>{
    if (socket) {
           socket.emit('create_ticket', {
            product:productName,
            workspace_id: "63cf89a0dcc2a171957b290b",
            email: "reddypranai2017@gmail.com",
            link_id:"37324795525379026095",
            api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
            created_at: new Date()
        }); 
        socket.on('ticket_response', (res) => {
           
            if(res.data._id && res.data.user_id){
                setTicketId(res.data._id)
                setUserId(res.data.user_id)
                localStorage.setItem("ticketId",res.data._id)
                localStorage.setItem("userId",res.data.user_id)
                getOrderId(res.data._id,res.data.user_id)
            }
        }); 
      
   }
}


const handleSendChatMessage = () => {
    if (messageText.trim() !== "") {
        let obj={
            messageText,
            sender:"user"
        }
        socket.emit('ticket_message_event', {
            ticket_id: ticketId,
            product: productName,
            message_data: JSON.stringify(obj),
            user_id:userId,
            reply_to: "None",
            workspace_id: "63cf89a0dcc2a171957b290b",
            api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
            created_at: new Date().getTime()
        });
        setMessageText("");
    }
};




const getAllMessages=()=>{
    socket.emit('get_ticket_messages', {
        ticket_id: ticketId,
        product: productName,
        workspace_id: "63cf89a0dcc2a171957b290b",
        api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
    });
   
}


const showChat=()=>{
    setShowChatModal(true)
    handleMessageResponse()
    // getAllMessages()
}

  return (
    <div className=' bg-gray-200 p-3 '>
      <h1>Online Shop</h1>
      <p>Workspace ID: {workspaceId}</p>
      <p>Store ID: {storeId}</p>
     
      <div>
      {!showChatModal ?(
                     <div className='cursor-pointer min-h-[50px] w-max fixed right-4 bottom-[200px] rounded flex items-center justify-center'>
                     <button onClick={showChat}>
                         {/* <IoPersonSharp className='text-2xl sm:text-4xl lg:text-4xl' /> */}
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" 
                        className="ml-1.5 w-10 h-10 text-green-700" height="1em"
                         width="1em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354
                            -.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.5 
                            5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4z"
                            ></path></svg>
                     </button>
                 </div>
                    ):(
                        <>
                            {ticketId ?(
                              <Modal
                                    isOpen={() => setShowChatModal(true)}
                                    onClose={() => setShowChatModal(false)}
                                    title="Chat"
                                >
                                    <div className="flex flex-col  w-full h-52 overflow-scroll border border-sky-400 rounded-xl">
                                       
                                    {messages.map((msg, index) => {
                                        let obj = JSON.parse(msg.message_data);
                                        return (
                                            <div key={index} className={obj.sender === "user" ? "flex justify-end mx-2" : "flex justify-start mx-2"}>
                                                <div className={obj.sender === "user" ? "bg-blue-400 rounded-xl my-2 px-3 py-1" : "bg-green-400 rounded-xl my-2 px-3 py-1"}>
                                                    {obj.messageText}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    </div>
                                    <div className="flex flex-row items-center justify-between">
                                        <textarea
                                            className="w-full h-max border rounded p-2 mb-2"
                                            placeholder="Type your message here..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                        />
                                     <button  onClick={handleSendChatMessage}>Send</button>
                                           
                                  
                                   </div>
                                </Modal>
                              
                            ):(
                                <>
                                 <Modal
                                    isOpen={() => setShowChatModal(true)}
                                    onClose={() => setShowChatModal(false)}
                                    title="Chat"
                                >
                                    <div className="flex flex-row items-end justify-between h-52">
                                        <button className="p-2 bg-red-400 rounded-xl text-blue-700 font-medium"
                                        onClick={()=>{createTicket()}}>click here to open a ticket
                                        </button>
                                   </div>
                                </Modal>
                                </>
                            )}
                              </>
                    )}
                   
      </div>
    </div>
  );
};

export default OnlineShop;
