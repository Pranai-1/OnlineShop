import io from 'socket.io-client';
const ENDPOINT = "https://www.dowellchat.uxlivinglab.online"

import { useState,useEffect, useCallback } from 'react';
const Manager=()=>{

    const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [socket, setSocket] = useState(null);
  const [productName, setProductName] = useState('test_product')
  const[ticketCount,setTicketCount]=useState(0)
  const[ticketData,setTicketData]=useState([])
  const[messages,setMessages]=useState({})
  const[openedChatDetails,setOpenedChatDetails]=useState()
  const[managerId,setManagerId]=useState(null)


  useEffect(() => {
    const newSocket = io(ENDPOINT);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.emit('get_tickets', {
      product: productName,
      workspace_id: "63cf89a0dcc2a171957b290b",
      api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
    });

    socket.on('ticket_response', (res) => {
      if (res.operation === "get_ticket") {
        const tickets = res.data.filter(data => !data.is_closed).map(arr => ({
          ticketId: arr._id,
          userId: arr.user_id,
          lineManager: arr.line_manager,
        }));
       tickets.map((ticket)=>{
          getAllMessages(ticket.ticketId)
       })
        setTicketData(tickets);
        setTicketCount(tickets.length)
      } else if (res.operation === "close_ticket") {
        setTicketData(prevData => prevData.filter(ticket => ticket.ticketId !== openedChatDetails.ticketId));
        setTicketCount((prev)=>prev-1)
      }else{
        console.log(res.operation)
      }
    });

    getLineManagers()
    return () => {
      socket.off('ticket_response');
    };
  }, [socket, productName, openedChatDetails]);



function getLineManagers(){
socket.emit('get_all_line_managers', {
    workspace_id: "63cf89a0dcc2a171957b290b",
    api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
});

socket.on('setting_response', (res) => {
  if(res.operation=="get_all_line_managers"){
    setManagerId(res.data[0].user_id)
  }
});
}


  useEffect(()=>{
    if(socket){
    socket.on('ticket_message_response', (res) => {
      if (res.operation === "get_ticket_messages") {
        const id = res.data[0]?.ticket_id;
        const currentMessages = messages[id] || [];
        const updatedMessages = [...currentMessages, ...res.data];
        setMessages(prevMessages => ({
            ...prevMessages,
            [id]: updatedMessages
        }));
    }
    else{
      const id = res.data.ticket_id;
     updateMessages(id,res.data)
     }
        });    
    }
},[socket])

const updateMessages=(id,newMsg)=>{
     setMessages((prev)=>({...prev,
      [id]: [...(prev[id] || []), newMsg]
    }))
}


function closeTicket(){
    socket.emit('close_ticket', {
      ticket_id: openedChatDetails.ticketId,
      line_manager:openedChatDetails.lineManager,
      product: productName,
      workspace_id: "63cf89a0dcc2a171957b290b",
      api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
  });

  handleCloseChat()
}

function getAllMessages(ticketId) {
    socket.emit('get_ticket_messages', {
        ticket_id: ticketId,
        product: productName,
        workspace_id: "63cf89a0dcc2a171957b290b",
        api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
    });
    
}


const handleShowChat = () => {
    setShowChat(!showChat);
  };

  const handleChatOpen = (ticketId,userId,lineManager) => {
    setSelectedChat(ticketId);
    setOpenedChatDetails({ticketId,userId,lineManager})
  };



useEffect(()=>{
if(socket){
  socket.emit('get_all_topics', {
    workspace_id:"63cf89a0dcc2a171957b290b",
    api_key:"1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
});
socket.on('new_ticket', (res) => {
  let newTicket={
    ticketId: res.data._id,
    userId: res.data.user_id,
    lineManager: res.data.line_manager,
  }
  setTicketData((prev)=>[...prev,newTicket])
  setTicketCount((prev)=>prev+1)
});
}
},[socket])
  const handleSendChatMessage = () => {
    if (messageText.trim() !== "") {
      let obj={
        messageText,
        sender:"manager"
    }
      socket.emit('ticket_message_event', {
        ticket_id:openedChatDetails.ticketId,
        product: productName,
        message_data: JSON.stringify(obj),
        user_id:openedChatDetails.userId,
        reply_to: "None",
        workspace_id: "63cf89a0dcc2a171957b290b",
        api_key: "1b834e07-c68b-4bf6-96dd-ab7cdc62f07f",
        created_at: new Date()
    });
    
    setMessageText("");
   
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };


  const DummyData = ({ chat }) => {
    return (
      <div
        className='flex flex-col items-start justify-center rounded-3xl pl-6 py-1 my-3 bg-slate-300 gap-y-1 cursor-pointer'
        onClick={() => {
          handleChatOpen(chat.ticketId,chat.userId,chat.lineManager);
        }}
      >
        <span className='font-bold text-gray-700'>{chat.userId}</span>
        <div className='h-[20px] overflow-hidden'>
          {/* <span>{chat.messages[chat.messages.length-1]}</span> */}
        </div>
      </div>
    );
  };


 
    return(
        <div className="h-screen w-screen absolute">
            <div
            className={`fixed top-0 right-10 h-[550px] w-[350px] mt-4 px-4 bg-gray-200 rounded-md  ${
              showChat ? "" : "hidden"} `}
          >
           
            <div className='flex items-center justify-between pt-3'>
              <span className='font-semibold text-2xl'>Chats</span>
              <button  onClick={handleShowChat} className='text-red-500 cursor-pointer'>
                close
                </button>
            </div>
            <div className='mt-4 h-[470px] px-2 gap-y-4 overflow-auto'>
              {ticketData.map((chat) => (
                <DummyData  chat={chat} />
              ))}
            </div>
            </div>
        

          {selectedChat && (
          <div className='fixed bottom-0 left-10 md:left-52 w-[300px]  md:w-[400px] h-[400px] flex items-center justify-center bg-opacity-75 mb-4'>
          <div className='bg-gray-100 rounded-lg p-6 w-full h-full'>
            <div className='flex justify-between'>
              <h2 className='text-xl font-semibold mb-4'>
                Chat with {openedChatDetails.userId}
              </h2>
              <button
                className='text-red-500 cursor-pointer'
                onClick={handleCloseChat}
              >close</button>
            </div>
            <div >
              <div className="flex flex-col  w-full h-52 overflow-scroll border border-sky-400 rounded-xl">
              {messages[openedChatDetails.ticketId] && messages[openedChatDetails.ticketId].map((msg, index) => {
               let obj = JSON.parse(msg.message_data);
               return (
                   <div key={index} className={obj.sender === "manager" ? "flex justify-end mx-2" : "flex justify-start mx-2"}>
                       <div className={obj.sender === "manager" ? "bg-blue-400 rounded-xl my-2 px-3 py-1" : "bg-green-400 rounded-xl my-2 px-3 py-1"}>
                           {obj.messageText}
                       </div>
                   </div>
               );
            })}

              </div>
              <div className="flex flex-row items-center justify-between ">
                              <textarea
                                  className="w-full h-max border  p-2 m-2 rounded-lg"
                                  placeholder="Type your message here..."
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                              />
                              <button className='p-2  bg-blue-600 rounded-lg'
                                   onClick={handleSendChatMessage}
                              >send</button>
                </div>
                <button onClick={closeTicket} className='w-max flex justify-center items-center p-2 bg-red-600 rounded-lg'>Close Ticket</button>
            </div>
          </div>
        </div>
          )}
          <button onClick={()=>setShowChat(true)} className='p-2 bg-blue-400 rounded-lg '>show chats-{ticketCount}</button>
         
            </div>
    )
}

export default Manager





 // const ChatModal = ({ chat }) => {
  //   console.log(chat)
  //   return (
  //     <div className='fixed bottom-0 left-10 md:left-52 w-[300px]  md:w-[400px] h-[350px] flex items-center justify-center bg-opacity-75 mb-4'>
  //       <div className='bg-gray-100 rounded-lg p-6 w-full h-full'>
  //         <div className='flex justify-between'>
  //           <h2 className='text-xl font-semibold mb-4'>
  //             Chat with {chat && chat.email.split("@")[0]}
  //           </h2>
  //           <button
  //             className='text-red-500 cursor-pointer'
  //             onClick={handleCloseChat}
  //           >close</button>
  //         </div>
  //         <div >
  //           <div className="flex flex-col items-end w-full h-52 overflow-scroll border border-sky-400 rounded-xl">
  //           {chat.messages.map((msg, index) => (
  //             <div key={index}>
  //                 <div className="px-3 py-1 bg-blue-400 rounded-xl my-2">{msg}</div>
  //             </div>
  //           ))}
  //           </div>
  //           <div className="flex flex-row items-center justify-between ">
  //                           <textarea
  //                               className="w-full h-max border rounded p-2 mb-2"
  //                               placeholder="Type your message here..."
  //                               value={messageText}
  //                               onChange={(e) => setMessageText(e.target.value)}
  //                           />
  //                           <button className='p-2 bg-blue-600 rounded-lg'
  //                                onClick={handleSendChatMessage}
  //                           >send</button>
  //             </div>
  
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };






