import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React ,{useState} from 'react'
import { ChatState } from '../context/ChatProvider';
import axios from 'axios';
import Userlist from '../components/useravatar/Userlist';
import Userbedge from '../components/useravatar/Userbedge';

const Groupmodel = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
  
    const { user, chats, setChats } = ChatState();

    const handlesearch = async(query)=>{
        setSearch(query)
        if(!query){
            return
        }
        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`https://chat-8wv9.onrender.com/api/v1/users?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
              });
        }
    }
    const handlesubmit = async()=>{
        if (!groupChatName || !selectedUsers) {
            toast({
              title: "Please fill all the feilds",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top",
            });
            return;
          }
      
          try {
            const config = {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            };
            const { data } = await axios.post(
              `https://chat-8wv9.onrender.com/api/v1/group`,
              {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map((u) => u._id)),
              },
              config
            );
            setChats([data, ...chats]);
            onClose();
            toast({
              title: "New Group Chat Created!",
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
          } catch (error) {
            toast({
              title: "Failed to Create the Chat!",
              description: error.response.data,
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
          }
    }

    const handledel = (deluser)=>{
        setSelectedUsers(selectedUsers.filter((sel)=>sel._id !== deluser._id))
    }
    const handlegroup = (useradd)=>{
        if(selectedUsers.includes(useradd)){
            toast({
                title: "User already added",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
              });
              return;
        }
        setSelectedUsers([...selectedUsers,useradd])
    }


    return (
        <>
            <span onClick={onOpen}>{children}</span>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader 
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >Create Group</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input placeholder='Create Group Name' mb={4} onChange={(e)=>setGroupChatName(e.target.value)} />
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add Users To Group' mb={1} onChange={(e)=>handlesearch(e.target.value)} />
                        </FormControl>
                        <Box width='100%' display='flex' flexWrap='wrap'>
                        {selectedUsers.map((user)=>(
                            <Userbedge key={user._id} user={user} handlefun={()=>handledel(user)} />
                        ))}
                        </Box>

                        {loading ? <Spinner /> : (
                            searchResult.slice(0,4).map((user)=>(
                                <Userlist key={user._id} user={user} handlefun={()=>handlegroup(user)} />
                            ))
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue'  onClick={handlesubmit}>
                            Create Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default Groupmodel
