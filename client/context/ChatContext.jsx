import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [message, setMessage] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // function to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  //funtion to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessage(data.messages);
      }
    } catch (error) {
      toast.message(error.message);
    }
  };
  //funtion to send message to selected user
  const sendMessages = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessage((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //funtion to subscribe to messages for seleted user

  const subscribeToMessages = async () => {
    try {
      if (!socket) return;

      socket.on("newMessage", (newMessage) => {
        if (selectedUser && newMessage.senderId === selectedUser._id) {
          newMessage.seen = true;
          setMessage((prevMessages) => [...prevMessages, newMessage]);
          axios.put(`/api/messages/mark/${newMessage._id}`);
        } else {
          setUnseenMessages((preUnseenMessages) => ({
            ...preUnseenMessages,
            [newMessage.senderId]: preUnseenMessages[newMessage.senderId]
              ? preUnseenMessages[newMessage.senderId] + 1
              : 1,
          }));
        }
      });
    } catch (error) {
      toast.error(error.message);
    }
  };
  //function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    message,
    users,
    selectedUser,
    getUsers,
    setMessage,
    sendMessages,
    setSelectedUser,
    unseenMessages,
    getMessages,
    setUnseenMessages,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
