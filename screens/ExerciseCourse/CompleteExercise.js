import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import ProgressCircle from "../../components/ProgressCircle1";
import GrayCircle from "../../components/GrayCircle";
import { ScrollView } from "react-native-gesture-handler";
import { AppContext } from "../../components/ContextProvider";
import { colors } from "../../colors";
import { Alert, Share, View, Button } from "react-native";
import { WithLocalSvg } from "react-native-svg";
import { useRoute } from "@react-navigation/native";
import Check from "../../assets/SVGs/Check.svg";
import axios from "axios";

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0px 23.5px;
  background: ${colors.white};
`;

const ExerciseText = styled.Text`
  font-weight: 600;
  font-size: 24px;
  text-align: center;
  line-height: 33.6px;
`;

const ExerciseExplainText = styled.Text`
  padding: 8px;
  color: ${colors.l_main};
  text-align: center;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 19.5px;
  margin-bottom: 41px;
`;

const ResultButton = styled.TouchableOpacity`
  width: 327px;
  height: 52px;
  border-radius: 12px;
  background: ${colors.l_main};
  justify-content: center;
  margin-bottom: 8px;
`;

const HomeButton = styled.TouchableOpacity`
  width: 327px;
  height: 52px;
  border-radius: 12px;
  background: ${colors.grey_1};
  justify-content: center;
`;

const ButtonText = styled.Text`
  color: ${colors.white};
  text-align: center;
  font-size: 17px;
  font-style: normal;
  font-weight: 600;
`;

const ButtonText2 = styled.Text`
  color: ${colors.black};
  text-align: center;
  font-size: 17px;
  font-style: normal;
  font-weight: 600;
`;

const CirclesLine = styled.View`
  flex-direction: row;
  width: 256px;
  justify-content: space-around;
`;

const ExerciseRec = styled.View`
  width: 311px;
  height: 175px;
  border-radius: 12px;
  background: ${colors.grey_1};
  margin-bottom: 68px;
  justify-content: center;
  align-items: center;
  padding: 16px;
`;

const RecText1 = styled.Text`
  color: #262626;
  font-size: 13px;
  font-weight: 400;
  line-height: 19.5px;
  width: 188px;
`;

const RecTextLine = styled.View`
  flex-direction: row;
  width: 279px;
  margin-bottom: 4px;
  justify-content: space-between;
`;

export default function CompleteExercise({ navigation }) {
  const { isDark } = useContext(AppContext);

  const goToHome = () => navigation.navigate("HomeNav");
  const goToResult = () => navigation.navigate("ExerciseResult");

  const route = useRoute();
  const dataList = route.params.dataList;
  const routineIdx = route.params.routineIdx;
  const totalTime = route.params.totalTime * -1;

  // console.log(listIndex);
  // console.log(dataList);
  // console.log(routineIdx);
  // console.log(totalTime);

  const [shouldRender, setShouldRender] = useState(true);
  useEffect(() => {
    // 일정 시간(예: 5초) 후에 렌더링 여부를 false로 변경
    const timer = setTimeout(() => {
      setShouldRender(false);
    }, 5000);

    // 컴포넌트가 언마운트되면 타이머 클리어
    return () => clearTimeout(timer);
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때만 실행

  const Week = new Array("sun", "mon", "tue", "wed", "thu", "fri", "sat");

  const now = new Date();
  let day = Week[now.getDay()];
  const [resultData, setResultData] = useState([]);
  const [detailData, setDetailData] = useState([]);

  const getResultData = async (routineIdx) => {
    try {
      let url = "https://gpthealth.shop/";
      let detailAPI = `/app/process/end?routineIdx=${routineIdx}`;

      const response = await axios.get(url + detailAPI, {
        params: {
          routineIdx: routineIdx,
        },
      });
      const result = response.data;
      console.log(result);
      return result;
    } catch (error) {
      console.error("Error", error);
    }
  };

  useEffect(() => {
    getResultData(routineIdx).then((response) => {
      setResultData(response.result);
      setDetailData(response.result.getComparison);
      console.log(detailData);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <Container>
        <ExerciseText>운동을 완료했어요!</ExerciseText>

        {shouldRender ? (
          <ExerciseExplainText>중량 정보를 업데이트 했어요</ExerciseExplainText>
        ) : (
          <ExerciseExplainText>
            한달동안 루틴을 {resultData.monthCountHealth}회 완료했어요
          </ExerciseExplainText>
        )}

        <CirclesLine>
          <ProgressCircle
            num={Math.ceil(totalTime / 60)}
            unit="분"
            title="소요시간"
            bubbleOn={true}
            bubbleText={Math.ceil(detailData.exerciseTimeChange)}
          />
          <GrayCircle
            num={resultData.todayTotalWeight}
            unit="kg"
            title="오늘 든 무게"
            bubbleOn={true}
            bubbleText={detailData.weightChange}
          />
          <GrayCircle
            num={resultData.todayTotalCalories}
            unit="kcal"
            title="소모 칼로리"
            bubbleOn={false}
          />
        </CirclesLine>

        <ExerciseRec>
          <ScrollView>
            {dataList.map((item) => (
              <RecTextLine key={item.exerciseInfo.healthCategoryIdx}>
                <RecText1>{item.exerciseInfo.exerciseName}</RecText1>

                <WithLocalSvg asset={Check} width={20} height={20} />
              </RecTextLine>
            ))}
          </ScrollView>
        </ExerciseRec>

        <ResultButton onPress={goToResult}>
          <ButtonText>결과 자세히 보기</ButtonText>
        </ResultButton>

        <HomeButton onPress={goToHome}>
          <ButtonText2>홈으로 돌아가기</ButtonText2>
        </HomeButton>
      </Container>
    </SafeAreaView>
  );
}