import React, { useEffect, useState } from "react";
import { styled } from "styled-components/native";
import TotalChart from "./TotalChart";
import { useRecoilValue } from "recoil";
import { IsDarkAtom } from "../../recoil/MyPageAtom";
import { colors } from "../../colors";

const Container = styled.View`
  width: 100%;
  margin-bottom: 50px;
`;
const Exercise = styled.View`
  padding-top: 24px;
`;
const Block = styled.View`
  padding: 8px 24px;
  align-items: center;
  flex-direction: row;
`;
const Circle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background-color: #f3f3f3;
  margin-right: 16px;
`;
const BlockContent = styled.View``;
const Data = styled.View`
  flex-direction: row;
`;
const Title = styled.Text`
  font-size: 17px;
  font-weight: 600;
  line-height: 25.5px;
  margin: 0px 24px 16px 24px;
  color: ${({ isDark }) => (isDark ? colors.white : colors.black)};
`;
const CircleText = styled.Text`
  font-size: 24px;
  font-weight: 600;
  line-height: 33.6px;
  color: ${({ isDark }) => (isDark ? colors.white : colors.black)};
`;
const CircleMiniText = styled.Text`
  font-size: 13px;
  font-weight: 400;
  line-height: 19.5px;
  padding-top: 8px;
  color: ${({ isDark }) => (isDark ? colors.white : colors.black)};
`;
const CircleTitle = styled.Text`
  font-size: 13px;
  font-weight: 400;
  line-height: 19.5px;
  color: ${({ isDark }) => (isDark ? colors.white : colors.black)};
`;

export default function Analysis(props) {
  const isDark = useRecoilValue(IsDarkAtom);

  const weekData = props.weekData;

  const firstMonth = weekData.startAndEndExercise[0].firstMonth;
  const firstWeek = weekData.startAndEndExercise[0].firstWeek;
  const lastMonth = weekData.startAndEndExercise[0].lastMonth;
  const lastWeek = weekData.startAndEndExercise[0].lastWeek;
  const startingIndex = (firstMonth - 1) * 6 + firstWeek - 1;
  const finishingIndex = (lastMonth - 1) * 6 + lastWeek - 1;
  const slicedWeekData = weekData.formattedRows.slice(
    startingIndex,
    finishingIndex
  );
  const calorie = weekData.formattedRows[finishingIndex].weeklyCalories;
  const kilometer = weekData.formattedRows[finishingIndex].weeklyDistance;
  const TimeData = weekData.formattedRows
    .slice(startingIndex, finishingIndex)
    .map((value) => value.weeklyExerciseTime);
  let sum = 0;
  for (let i = 0; i < TimeData.length; i++) {
    sum += TimeData[i];
  }
  const hour = (sum / 3600).toFixed(2);

  return (
    <Container>
      <TotalChart weekData={slicedWeekData} />
      <Exercise>
        <Title isDark={isDark}>운동 현황</Title>
        <Block>
          <Circle />
          <BlockContent>
            <Data>
              <CircleText isDark={isDark}>{calorie} </CircleText>
              <CircleMiniText isDark={isDark}>kcal</CircleMiniText>
            </Data>
            <CircleTitle isDark={isDark}>
              최근 일주일 간 소모한 칼로리
            </CircleTitle>
          </BlockContent>
        </Block>
        <Block>
          <Circle />
          <BlockContent>
            <Data>
              <CircleText isDark={isDark}>{kilometer} </CircleText>
              <CircleMiniText isDark={isDark}>km</CircleMiniText>
            </Data>
            <CircleTitle isDark={isDark}>최근 일주일 간 뛴 거리</CircleTitle>
          </BlockContent>
        </Block>
        <Block>
          <Circle />
          <BlockContent>
            <Data>
              <CircleText isDark={isDark}>{hour} </CircleText>
              <CircleMiniText isDark={isDark}>Hour</CircleMiniText>
            </Data>
            <CircleTitle isDark={isDark}>총 누적 운동 시간</CircleTitle>
          </BlockContent>
        </Block>
      </Exercise>
    </Container>
  );
}
