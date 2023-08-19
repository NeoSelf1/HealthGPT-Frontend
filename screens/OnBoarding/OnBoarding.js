import React, { useState } from "react";
import styled from "styled-components/native";
import { colors } from "../../colors";
import { Button } from "../../Shared";
import { StyleSheet, Text, StatusBar } from "react-native";
import {
  ScreenLayout,
  Title,
  SubText,
  Input,
  StatusText,
} from "../../components/Shared/OnBoarding_Shared";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { IsDarkAtom } from "../../recoil/MyPageAtom";

const TextContainer = styled.View`
  margin-top: 124px;
  flex-direction: column;
  width: 100%;
  justify-content: center;
`;
const BottomContainer = styled.View`
  align-items: center;
  width: 100%;
  flex: 1;
  padding-top: 76px;
`;
const ORContainer = styled.View`
  margin-top: 158px;
  width: 120px;
  height: 13px;
`;
const Line = styled.View`
  width: 100%;
  border: ${StyleSheet.hairlineWidth}px solid ${colors.grey_5};
  margin-top: 6px;
`;
const ORText = styled.Text`
  color: ${colors.grey_6};
  font-size: 13px;
  position: absolute;
  background-color: ${colors.grey_1};
  width: 40px;
  text-align: center;
  left: 40px;
`;
const SNSContainer = styled.View`
  justify-content: space-between;
  flex-direction: row;
  width: 70%;
  margin-top: 28px;
`;
const SNSButton = styled.TouchableOpacity`
  width: 64px;
  background-color: white;
  height: 64px;
`;

const OnBoarding = ({ navigation }) => {
  const isDark = useRecoilValue(IsDarkAtom);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchResult = async (email) => {
    try {
      let url = "https://gpthealth.shop/";
      let detailAPI = "app/user/";
      const queryStr = `?userId=${email}`;
      const response = await axios.get(url + detailAPI + queryStr);
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const isUserId =
    email.indexOf("@") != -1 && email.length <= 40 && email.indexOf(".") != -1;

  const handleSubmit = () => {
    console.log("submitted");
    setIsLoading(true);
    fetchResult(email).then((data) => {
      setIsLoading(false);
      if (data.code == 3003) {
        navigation.navigate("CreateAccount_1", {
          email,
        });
      } else {
        navigation.navigate("Login", {
          email,
        });
      }
    });
  };

  return (
    <ScreenLayout isDark={isDark}>
      <TextContainer>
        <Title text="이메일을 입력해주세요." isDark={isDark} />
        <SubText text="로그인 또는 회원가입에 필요합니다." isDark={isDark} />
      </TextContainer>
      <BottomContainer>
        <Input
          style={[
            email.length > 20 && { borderWidth: 1, borderColor: colors.red },
            {
              backgroundColor: isDark ? colors.black : colors.white,
              color: isDark ? colors.white : colors.black,
            },
          ]}
          keyboardType="url"
          placeholderTextColor={colors.grey_5}
          onSubmitEditing={() => handleSubmit()}
          placeholder="이메일 입력"
          returnKeyType="next"
          blurOnSubmit={false}
          onChangeText={(text) => setEmail(text)}
        />
        {email.length > 20 && (
          <StatusText
            style={{ color: colors.red, marginTop: 4, width: "100%" }}
          >
            20자 이하로 설정해주세요.
          </StatusText>
        )}
        {/* <ORContainer>
          <Line />
          <ORText>또는</ORText>
        </ORContainer>
        <SNSContainer>
          <SNSButton>
            <Text>Google</Text>
          </SNSButton>
          <SNSButton>
            <Text>Kakao</Text>
          </SNSButton>
          <SNSButton>
            <Text>Naver</Text>
          </SNSButton>
        </SNSContainer> */}
      </BottomContainer>
      <Button
        loading={isLoading}
        isDark={isDark}
        enabled={isUserId && !isLoading}
        onPress={() => handleSubmit()}
      />
    </ScreenLayout>
  );
};

export default OnBoarding;
