import React, { useEffect, useState } from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box, Button, FormControl, IconButton, Image, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import Robo from '../assets/robot.gif'
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderfull } from './config/Chatlogic';
import Profilemodel from '../content/Profilemodel';
import axios from 'axios'
import './style.css'
import Updategroupmodel from '../content/Updategroupmodel'
import Scrollchat from './Scrollchat';
import io from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from './Lottie.json'
import Picker from 'emoji-picker-react'
import { BsEmojiSmileFill } from "react-icons/bs"


const ENDPOINT = "https://chat-8wv9.onrender.com"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;


const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [emojipic, setEmojipic] = useState(false)
    const toast = useToast();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("")
                const { data } = await axios.post(
                    "https://chat-8wv9.onrender.com/api/v1/sendmessage",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                );
                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [])

    const handleemoji = () => {
        setEmojipic(!emojipic)
    }


    const typingHandler = (e) => {
        setNewMessage(e.target.value)
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    }

    const fetchchata = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `https://chat-8wv9.onrender.com/api/v1/allmessage/${selectedChat._id}`,
                config
            );
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    }

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    useEffect(() => {
        fetchchata()
        selectedChatCompare = selectedChat
    }, [selectedChat])


    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        width="100%"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton display={{ base: "flex" }} onClick={() => setSelectedChat("")}>
                            <ArrowBackIcon />
                        </IconButton>
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <Profilemodel user={getSenderfull(user, selectedChat.users)} />
                            </>) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <Updategroupmodel fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchchata={fetchchata} />

                            </>
                        )}
                    </Text>
                    <Box display="flex"
                        flexDirection="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        width="100%"
                        height="100%"
                        borderRadius="lg"
                        overflowY="hidden">
                        {loading ? (<Spinner size="xl"
                            w={20}
                            h={20}
                            alignSelf="center"
                            margin="auto" />) : (<div className='mgs'>
                                <Scrollchat messages={messages} />
                            </div>)}
                        {istyping ? (
                            <div>
                                <Lottie
                                    options={defaultOptions}
                                    // height={50}
                                    width={70}
                                    style={{ marginBottom: 15, marginLeft: 0 }}
                                />
                            </div>
                        ) : (
                            <></>
                        )}
                        <FormControl onKeyDown={sendMessage}
                            id="first-name"
                            isRequired
                            display='flex'
                            alignItems='center'
                            justifyContent='space-between'
                            position='relative'
                            mt={3}>
                            <BsEmojiSmileFill width='100%' height='100%' color='black' cursor='pointer' onClick={handleemoji} position='relative'  />
                            {emojipic && <Picker height= "300px" width="300px" onEmojiClick={(emojiObject) => setNewMessage((prevMsg) => prevMsg + emojiObject.emoji)} />}
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                value={newMessage}
                                width='97%'
                                onChange={typingHandler}
                            />

                        </FormControl>

                    </Box>
                </>
            ) : (
                <Box display='flex' justifyContent='center' height='100%' flexDirection='column' alignItems='center'>
                    <Image src={Robo} />
                    <Text fontSize='3xl'>Select User To Chat</Text>
                </Box>
            )}
        </>
    )
}

export default SingleChat
