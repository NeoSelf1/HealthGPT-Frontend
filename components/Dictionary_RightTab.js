import React, { useState, useRef, useContext, useEffect } from "react";
import styled from "styled-components/native";
import { Alert, TouchableWithoutFeedback, Keyboard, View } from "react-native";
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
//   BottomSheetFlatList
} from "@gorhom/bottom-sheet";
import { colors } from "../colors";
import WrappedText from "react-native-wrapped-text";
import axios from "axios";
import { IsDarkAtom } from "../recoil/MyPageAtom"
import { useRecoilValue } from "recoil"



export default function Dictionary_RightTab(props) {
    const isDark = useRecoilValue(IsDarkAtom)
    const UserName = styled.Text`
        color: ${isDark ? colors.d_main : colors.l_main};
        font-size: 11px;
        font-weight: 400;
        margin-left: 8px;
        margin-bottom: 5px;
    `
    const SendBtn = styled.TouchableOpacity`
        background-color: ${isDark ? colors.d_main : colors.l_main};
        width: 32px;
        height: 32px;
        border-radius: 16px;
    `
    const scrollviewRef = useRef(null)
   
    const onSubmitChat = () => {
        let temp = []
        chat.length == 0? 
            null
            : 
            (
            postChat(),
            setChat(""),
            funcSetJoinBtnBool(true),
            setChatUpdate(!chatUpdate),
            // putChatRead()
            scrollviewRef.current?.scrollToEnd({ animated: true })
            )
    }
    const onFocusInput = () => {
        scrollviewRef.current?.scrollToEnd({ animated: true })
    }

    const [msg, setMsg] = useState([])
    const [chat, setChat] = useState("")
    const [chatUpdate, setChatUpdate] = useState(false)
    const [chatIdx, setChatIdx] = useState([])

    // 참여하기 버튼
    const { parentJoinBtnBool, parentSetJoinBtnBool, exerciseName } = props
    const [childJoinBtnBool, setChildJoinBtnBool] = useState(parentJoinBtnBool)
    useEffect(() => {
    setChildJoinBtnBool(parentJoinBtnBool)
    }, [parentJoinBtnBool])
    const funcSetJoinBtnBool = (newBool) => {
    setChildJoinBtnBool(newBool)
    parentSetJoinBtnBool(newBool)
    }

    // 채팅 불러오기
    const getChat = async () => {
        try {
            let url = "https://gpthealth.shop/"
            let detailAPI = "/app/dictionary/exercisechat"
            const response = await axios.get(url + detailAPI, {
                params: {
                    name: exerciseName,
                },
            })
            const result = response.data

            if(result.result.isSuccess) 
            console.log(`채팅 불러오기 성공 (운동이름 : ${exerciseName})`)
            else console.log(`채팅 불러오기 성공 (운동이름 : ${exerciseName})`)
    
            return result.result
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }
    useEffect(() => {
        getChat().then((result) => {
            setMsg(result.chattinginfo)

            const lastIdx = result.chattinginfo.at(-1).healthChattingIdx
            // putChatRead(lastIdx)
        })
    }, [parentJoinBtnBool,chatUpdate])

    //채팅 보내기
    const postChat = async () => {
        try {
            let url = "https://gpthealth.shop/"
            let detailAPI = "/app/dictionary/chatting"
            const response = await axios.post(url + detailAPI, {
                "name": exerciseName,
                "text": chat
            })
            const result = response.data
            if(result.result.isSuccess) 
                console.log(`채팅 업로드 성공 (운동: ${exerciseName}, 닉네임: ${myNickName}, 내용: ${chat})`)
            else console.log(`채팅 업로드 실패 (운동: ${exerciseName}, 닉네임: ${myNickName}, 내용: ${chat})`)
        } 
        catch (error) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
            console.error("Failed to fetch data:", error);
        }
    } 

    // 닉네임 알아오기
    const [myNickName, setMyNickName] = useState("")
    const getNickname = async () => {
        try {
            let url = "https://gpthealth.shop/"
            let detailAPI = `app/mypage/userinfo`
            const response = await axios.get(url + detailAPI);
            const result = response.data
            return result
        } 
        catch (error) {
        console.error("Failed to fetch data:", error);
        }
    }
    useEffect(()=>{
    getNickname().then((result)=>{
        setMyNickName(result.result[0].userNickname)
    })
    }, [])


    // 채팅 삭제 
    const deleteChat = async (idx) => {
    try {
        let url = "https://gpthealth.shop/"
        let detailAPI = `app/dictionary/deleteChatt`
        const response = await axios.patch(url + detailAPI, {
            healthChattingIdx: idx
        })
        const result = response.data

        if(result.isSuccess) console.log(`채팅 삭제 성공(idx: ${idx})`)
        else console.log(`채팅 삭제 실패(idx: ${idx})`)
        return result
    } 
    catch (error) {
        console.error("Failed to fetch data:", error)
    }
    }

    // 채팅 삭제 버튼
    const onPressMsgDeleteBtn = (idx) => {
        Alert.alert(
        "채팅 삭제",
        "채팅방에서 삭제되며\n채팅 내용은 복구되지 않습니다.",
        [
            { text: "취소" },
            {
                text: "삭제하기",
                onPress: () => {
                    deleteChat(idx)
                    setChatUpdate(!chatUpdate)
                },
                style: "destructive",
            },
        ]
        )
        setSelectedIdx(-1)
    }

    // 어디까지 읽었는지 저장
    const putChatRead = async (idx) => {
        try {
            let url = "https://gpthealth.shop/"
            let detailAPI = "/app/dictionary/chatRead"
            const response = await axios.put(url + detailAPI, {
                healthChattingIdx: 40,
            })
            const result = response.data   
            console.log(result)
    
            return result.result
        } catch (error) {
            console.error("Failed to fetch data:", error)
        }
    }

    // 삭제하려는 메시지의 msg 배열에서의 index값
    const [selectedIdx, setSelectedIdx] = useState(-1)

    //메시지를 꾹 눌렀을 때 메시지 삭제 버튼 토글
    const onLongPress = (i) => {
        // Vibration.vibrate()
        if(i==selectedIdx) setSelectedIdx(-1)
        else setSelectedIdx(i)

        {/* 햅틱 효과 넣고 싶다 아님 띠용 이펙트 */}
    }

    return (
      <>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <BottomSheetScrollView
                ref={scrollviewRef}
                style={{ paddingTop: 28 }}
                showsVerticalScrollIndicator={false}
            >
                {msg.map((msg, i) => (
                    <ChatContainer key={i}>
                        {msg.userNickname != myNickName ? 
                            (<MessageWrapper>
                                <UserName>{msg.userNickname}</UserName>
                                <MessageContainer style={{backgroundColor: isDark? `${colors.grey_8}`:`${colors.grey_1}`}}>
                                    <WrappedText
                                    textStyle={{
                                        fontWeight: 400,
                                        fontSize: 13,
                                        color: isDark? `${colors.white}`:`${colors.black}`,
                                        lineHeight: 17,
                                    }}
                                    >
                                    {msg.text}
                                    </WrappedText>
                                </MessageContainer>
                            </MessageWrapper>)
                        : 
                            (<MyMessageWrapper> 
                                {selectedIdx===i && <MsgDeleteBtn onPress={()=>onPressMsgDeleteBtn(msg.healthChattingIdx)} />}
                                <MyMessageContainer 
                                    onLongPress={()=>onLongPress(i)}
                                    style={{backgroundColor: isDark? `${colors.grey_8}`:`${colors.grey_1}`}}
                                >
                                    <WrappedText 
                                        textStyle={{
                                            fontWeight: 400,
                                            fontSize: 13,
                                            color: isDark? `${colors.white}`:`${colors.black}`,
                                            lineHeight: 17,
                                        }}
                                        containerStyle={{ alignItems: "left" }}
                                    >
                                        {msg.text}
                                    </WrappedText>
                                </MyMessageContainer>
                            </MyMessageWrapper>)}
                    </ChatContainer>
                ))}
                <View style={{ height: 40 }} />
            </BottomSheetScrollView>
        </TouchableWithoutFeedback>

        {childJoinBtnBool ? null : (
          <TextInputBG style={{backgroundColor: isDark? `${colors.grey_7}`:`${colors.grey_1}`}}>
            <TextInputContainer style={{backgroundColor: isDark? `${colors.black}`:`${colors.grey_1}`}}>
                <BottomSheetTextInput
                    style={{
                        color: isDark? `${colors.white}`:`${colors.black}`,
                        width: 300,
                        marginLeft: 15,
                    }}
                    type="text"
                    onChangeText={(text) => {
                    setChat(text);
                    }}
                    value={chat}
                    onSubmitEditing={onSubmitChat}
                    autoFocus={true}
                    onFocus={onFocusInput}
                    keyboardAppearance= {isDark? 'dark':'light'}
                />
                <SendBtn 
                    onPress={onSubmitChat} 
                    style={{backgroundColor: isDark? `${colors.d_main}`:`${colors.l_main}`}}
                />
            </TextInputContainer>
          </TextInputBG>
        )}
      </>
    )
}

const ChatContainer = styled.View`
  margin-left: 24px;
  margin-bottom: 16px;
  margin-right: 24px;
`
const MessageWrapper = styled.View`
  align-items: flex-start;
`
const MessageContainer = styled.View`
  border-radius: 12px 12px 12px 0px;
  padding: 8px 16px;
  max-width: 200px;
`
const MyMessageContainer = styled.TouchableOpacity`
  border-radius: 12px 12px 0px 12px;
  padding: 8px 16px;
  max-width: 200px;
`
const MyMessageWrapper = styled.View`
  justify-content: flex-end;
  align-items: center;
  flex-direction: row;
`
const MsgDeleteBtn = styled.TouchableOpacity`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${colors.red};
  margin-right: 8px;
`
const TextInputBG = styled.View`
  background-color: ${colors.grey_1};
  justify-content: center;
  align-items: center;
  padding: 9px 16px;
`
const TextInputContainer = styled.View`
  border-radius: 50px;
  width: 100%;
  flex-direction: row;
  padding: 6px;
`
