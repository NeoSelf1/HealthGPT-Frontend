import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components/native";
import { ActivityIndicator, Keyboard } from "react-native";
import { Header } from "../../components/Shared/MyRoutine_Shared";
import { colors } from "../../colors";
import { Alert } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import axios from "axios";
import { pressBack } from "../../components/myRoutine/Functions";
import { MyToast, showToast } from "../../components/myRoutine/MyToast";
import WeekCalendar from "../../components/myRoutine/WeekCalendar";
import List_Custom from "../../components/myRoutine/List_Custom";
import List_Normal from "../../components/myRoutine/List_Normal";

const ScreenBase = styled.SafeAreaView`
  width: 100%;
  flex-direction: column;
  flex: 1;
  background-color: ${colors.white};
`;
const ContentBase = styled.View`
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  flex: 1;
`;
const ContentLayout = styled.View`
  width: 100%;
  flex-direction: column;
  flex: 1;
  background-color: #f6f8fa;
`;
const BottomSheetContainer = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
`;
const ExerciseContainer = styled.Pressable`
  padding: 24px;
  padding-top: 2px;
  flex-direction: column;
  background-color: ${colors.white};
`;
const ContentContainer = styled.View`
  height: 100%;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const TopContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  height: 24px;
`;
const NoRoutineText = styled.Text`
  font-size: 15px;
  color: ${colors.grey_7};
  font-weight: 400;
`;
const ExerciseTitle = styled.Text`
  font-size: 17px;
  margin-bottom: 6px;
  font-weight: 500;
`;
const IndicatorBase = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;
const SetContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: ${colors.grey_1};
  height: 48px;
  border-radius: 8px;
  margin-top: 10px;
`;
const ExtendedContainer = styled.View`
  width: 100%;
`;
const SetsText = styled.Text`
  font-size: 17px;
  flex: 1;
  color: ${colors.grey_8};
  font-weight: 400;
`;
const EditText = styled.Text`
  font-size: 17px;
  flex: 1;
  color: ${colors.grey_8};
  text-align: center;
  font-weight: 400;
`;
const EditBox = styled.TextInput`
  height: 32px;
  margin-right: 8px;
  flex-direction: row;
  align-items: center;
  border-radius: 8px;
  width: 56px;
  background-color: ${colors.grey_2};
`;

const SubmitText = styled.Text`
  font-size: 17px;
  color: ${colors.l_main};
  text-align: center;
  font-weight: 700;
`;
const SubmitButton = styled.TouchableOpacity`
  width: 56px;
  margin-left: 20px;
`;

export default MyRoutine = () => {
  //커스텀 or 일반 보기모드 식별 위함
  const [mode, setMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //요일별 운동 유무 및 각 요일 운동 idx 보관목적 ->custom하면서 변경될 수 있기에 useState로 저장
  const [SCHEDULE, setSCHEDULE] = useState([]);

  //각 요일에 대한 세부 루틴정보들 저장하기 위한 배열 useState
  const [routineData, setRoutineData] = useState([]);

  //커스텀모드에서 세부수정하고자 하는 운동종목 구분하기 위한 id값
  const [editingID, setEditingID] = useState(null);
  //요일 슬라이드로 변경되는 실시간 SCHEDULE배열 임시 저장하기 위한 함수
  const [newRoutine, setNewRoutine] = useState([]);

  const [newSCHE, setNewSCHE] = useState(null);
  //이전 ID값과 변경 이후 ID값 매칭된거, 이거로 app/routine/calendar 호출하기
  const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7);

  const bottomModal = useRef();
  const [snapPoints, setSnapPoints] = useState(["1%"]);
  const [modalState, setModalState] = useState(0);

  const [selectedId, setSelectedId] = useState(null);

  const extendModal = () => {
    console.log("modal Extended");
    //기존 스냅포인트 수치보다 키보드 절대높이인 28%를 더하여서 유동적인 bottomSheet면적에 대비
    if (modalState != 2) {
      setSnapPoints([`${parseInt(snapPoints[0]) + 28}%`]);
    }
    setModalState(2);
  };

  const toggleMode = () => {
    if (mode) {
      updateRoutine().then(
        (res) => {
          console.log("updateRoutine api 호출결과:", res);
          getRoutine().then((res) => {
            if (res.code == 1000) {
              console.log("getRoutine 실행됨", res);
              setRoutineData(res.result);
              setNewRoutine(res.result);
            } else {
              console.log("요일 루틴 가져오기 실패");
            }
          });
          showToast();
        } //눌렀을 때 mode가 true였을 때, 즉 커스텀모드에서 완료버튼을 눌렀을때.
      );
      getRoutines().then((res) => {
        if (res.result) {
          //올바른 데이터 백엔드로부터 받아옴
          processDayData(res.result);
        } else {
          console.log("백엔드로부터 올바른 myRoutines 데이터 받아오지 못함");
        }
      });
      if (newSCHE) {
        //SCHEDULE의 변경이 있었을 경우,
        let newSCHE_1 = JSON.parse(JSON.stringify(newSCHE));
        let tempNewSCHE = Object.keys(newSCHE_1).reduce((acc, k) => {
          let country = newSCHE_1[k];
          acc[country] = [...(acc[country] || []), k];
          return acc;
        }, {});
        //prettier-ignore
        let data = {"monRoutineIdx": SCHEDULE[tempNewSCHE[0]].routineId,"tueRoutineIdx": SCHEDULE[tempNewSCHE[1]].routineId,"wedRoutineIdx": SCHEDULE[tempNewSCHE[2]].routineId,"thuRoutineIdx": SCHEDULE[tempNewSCHE[3]].routineId,"friRoutineIdx": SCHEDULE[tempNewSCHE[4]].routineId,"satRoutineIdx": SCHEDULE[tempNewSCHE[5]].routineId,"sunRoutineIdx": SCHEDULE[tempNewSCHE[6]].routineId,}; //0번째 153
        updateRoutines(data).then((res) =>
          console.log("updateRoutineSchedule api 호출결과:", res)
        );
        setNewSCHE(null);
      }
    }
    setMode(!mode);
  };
  const popMessage = (id) => {
    Alert.alert("운동 편집", "", [
      {
        text: "상세옵션 편집",
        onPress: () => {
          setModalState(1);
          setSnapPoints([`${10 + 8 * newRoutine[id].content.length}%`]);
          //확대하고자 하는 운동종목의 세트수에 따라 확장되는 정도를 유동적으로 제어하기 위함
          setEditingID(id);
        },
        style: "default",
      },
      {
        text: "선택 운동 삭제",
        onPress: () => editRoutine(id, "deleteExercise", 1),
        style: "destructive",
      },
      {
        text: "취소",
        onPress: () => console.log("Cancel Pressed"),
        style: "default",
      },
    ]);
  };
  const handleBottomSubmit = () => {
    //일단 ModalState 변수를 0으로 변경하여
    setModalState(0);
    Keyboard.dismiss();
  };
  /**백엔드로부터 받아온 rawData를 요일요약 상단 컴퍼넌트에 렌더링하고자 숫자값만 담긴 배열로 후가공*/
  const processDayData = (rawData) => {
    let newArr = new Array(rawData.length);
    newArr[0] = { id: 0, routineId: rawData.monRoutineIdx };
    newArr[1] = { id: 1, routineId: rawData.tueRoutineIdx };
    newArr[2] = { id: 2, routineId: rawData.wedRoutineIdx };
    newArr[3] = { id: 3, routineId: rawData.thuRoutineIdx };
    newArr[4] = { id: 4, routineId: rawData.friRoutineIdx };
    newArr[5] = { id: 5, routineId: rawData.satRoutineIdx };
    newArr[6] = { id: 6, routineId: rawData.sunRoutineIdx };
    setSCHEDULE(newArr);
  };
  const getRoutines = async () => {
    try {
      let url = "https://gpthealth.shop/";
      let detailAPI = "app/routine/calendar";
      const response = await axios.get(url + detailAPI);
      const result = response.data;
      return result;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  const getRoutine = async () => {
    setIsLoading(true);
    try {
      let url = "https://gpthealth.shop/";
      //후가공한 SCHEDULE 배열에서의 IDX값을 그대로 가져와 query스트링으로 추가
      let detailAPI = `app/routine/${SCHEDULE[selectedDay].routineId}`;
      const response = await axios.get(url + detailAPI);
      const result = response.data;
      setIsLoading(false);
      return result;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  const updateRoutine = async () => {
    try {
      let url = "https://gpthealth.shop/";
      let detailAPI = `app/routine/${SCHEDULE[selectedDay].routineId}`;
      const response = await axios.put(url + detailAPI, newRoutine, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = response.data;
      return result;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  const updateRoutines = async (data) => {
    try {
      let url = "https://gpthealth.shop/";
      let detailAPI = "app/routine/calendar";
      const response = await axios.put(url + detailAPI, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = response.data;
      return result;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  const editRoutine = (id, type, value) => {
    let newArr = JSON.parse(JSON.stringify(newRoutine));
    if (type == "repeat") {
      newArr[editingID].content[id].rep = value;
    } else if (type == "weight") {
      newArr[editingID].content[id].weight = value;
    } else if (type == "deleteSet") {
      newArr[id].content.splice(value, 1);
    } else if (type == "deleteExercise") {
      newArr.splice(id, 1);
    } else {
      newArr[id].content.push({
        rep: newArr[id].content[newArr[id].content.length - 1].rep,
        weight: newArr[id].content[newArr[id].content.length - 1].weight,
      });
    }
    console.log("editRoutine수행 후 결과값:", newArr[id].content);
    setNewRoutine(newArr);
  };
  const onPressBottomModal = () => bottomModal.current?.present();

  useEffect(() => {
    if (SCHEDULE[selectedDay] != undefined) {
      getRoutine().then((res) => {
        console.log(res);
        if (res.code == 1000) {
          setRoutineData(res.result);
          setNewRoutine(res.result);
        } else {
          console.log("요일 루틴 가져오기 실패");
        }
      });
    }
  }, [selectedDay]);

  useEffect(() => {
    if (modalState == 0) {
      setSnapPoints(["1%"]);
    }
  }, [modalState]);

  useEffect(() => {
    onPressBottomModal();
  }, []);

  return (
    <BottomSheetModalProvider>
      <ScreenBase>
        <Header
          mode={mode}
          parentFunction={toggleMode}
          onPress={() => pressBack(setMode)}
        />
        <ContentLayout>
          {!mode && ( //루틴 요약내용을 확인할 수 있는 주간달력 컴퍼넌트
            <WeekCalendar
              setSelectedDay={setSelectedDay}
              selectedDay={selectedDay}
              SCHEDULE={SCHEDULE}
            />
          )}
          {mode ? (
            <List_Custom
              modalState={modalState}
              SCHEDULE={SCHEDULE}
              newRoutine={newRoutine}
              editRoutine={editRoutine}
              popMessage={popMessage}
              setNewSCHE={setNewSCHE}
            />
          ) : (
            <ContentBase>
              {isLoading ? (
                <IndicatorBase>
                  <ActivityIndicator size="large" color={colors.l_main} />
                </IndicatorBase>
              ) : routineData ? (
                <List_Normal
                  routineData={routineData}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
              ) : (
                <ContentContainer>
                  <NoRoutineText style={{ textAlign: "center", width: "100%" }}>
                    해당 요일에는 루틴이 없어요
                  </NoRoutineText>
                </ContentContainer>
              )}
              <MyToast />
            </ContentBase>
          )}

          <BottomSheetModal
            ref={bottomModal}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            enableHandlePanningGesture={false}
            enableContentPanningGesture={false}
            handleHeight={0}
            enableDismissOnClose
            handleIndicatorStyle={{ height: 0 }}
          >
            <BottomSheetContainer>
              <ExerciseContainer>
                <TopContainer>
                  <ExerciseTitle>
                    {routineData /** 운동이 없는 요일을 선택했을 경우, Null값이 반환됨에 따라 
                  null을 object로 만들수 없다는 오류를 피하기 위함 */ &&
                      routineData[editingID]?.exerciseName}
                  </ExerciseTitle>
                  <SubmitButton onPress={() => handleBottomSubmit()}>
                    <SubmitText>완료</SubmitText>
                  </SubmitButton>
                </TopContainer>
                <ExtendedContainer>
                  {newRoutine /** 운동이 없는 요일을 선택했을 경우, Null값이 반환됨에 따라 
                  null을 object로 만들수 없다는 오류를 피하기 위함 */ &&
                    newRoutine[editingID]?.content.map((item, id) => (
                      <SetContainer key={id}>
                        <ContentContainer key={id}>
                          <SetsText>{id + 1}</SetsText>
                          <EditBox
                            keyboardType="numeric"
                            selectTextOnFocus={item.weight != null}
                            editable={item.weight != null}
                            onFocus={() => extendModal()}
                            onChangeText={(value) =>
                              editRoutine(id, "weight", value)
                            }
                            style={
                              !item.weight && {
                                backgroundColor: colors.grey_2,
                              }
                            }
                          >
                            <EditText
                              style={item.weight && { color: colors.l_main }}
                            >
                              {item.weight ? item.weight : "-"}
                            </EditText>
                          </EditBox>
                          <SetsText>kg</SetsText>
                          <EditBox
                            keyboardType="numeric"
                            selectTextOnFocus={item.rep != null}
                            editable={item.rep != null}
                            onFocus={() => extendModal()}
                            onChangeText={(value) =>
                              editRoutine(id, "repeat", value)
                            }
                            style={
                              !item.rep && { backgroundColor: colors.grey_2 }
                            }
                          >
                            <EditText style={{ color: colors.l_main }}>
                              {item.rep}
                            </EditText>
                          </EditBox>
                          <SetsText>회</SetsText>
                        </ContentContainer>
                      </SetContainer>
                    ))}
                </ExtendedContainer>
              </ExerciseContainer>
            </BottomSheetContainer>
          </BottomSheetModal>
        </ContentLayout>
      </ScreenBase>
    </BottomSheetModalProvider>
  );
};
