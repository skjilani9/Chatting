import React, { useState } from 'react'
import {ChatState} from '../context/ChatProvider'
import Sidebar from '../content/Sidebar';
import { Box } from '@chakra-ui/react';
import Mychat from '../content/Mychat';
import Chatbox from '../content/Chatbox';

const Chat = () => {
    const [fetchAgain, setFetchAgain] = useState(false);
    const {user} = ChatState();

    return (
        <div style={{width:"100%"}}>
            {user && <Sidebar />}
            <Box
                display='flex'
                justifyContent='space-between'
                width='100%'
                height='92vh'
                p='10px'
            >
                {user && <Mychat fetchAgain={fetchAgain} />}
                {user && <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
            </Box>
        </div>
    )
}

export default Chat

