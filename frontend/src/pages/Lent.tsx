// import axios from "axios";
import { axiosApiCheck, axiosLentInfo, axiosCabinetInfo } from "../network/axios/axios.custom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Menu from "../component/Menu";
import MenuButton from "../component/button/MenuButton";
import Carousel from "../component/Carousel";
import Location from "../component/Location";
// import Question from "../component/Question";
import QuestionButton from "../component/button/QuestionButton";
import LentModal from "../modal/LentModal";
import ContentsModal from "../modal/ContentsModal";
// import EventModal from "../modal/EventModal";
// import { eventInfo } from "../event/EventType";
// import { useDispatch, useSelector } from "react-redux";
import { cabinetAll } from "../redux/slices/cabinetSlice";
import { lentAll } from "../redux/slices/lentSlice";
import { userAll } from "../redux/slices/userSlice";
import { RootState } from "../status";
import "./lent.css";
import "./main.css";
import { useAppSelector, useAppDispatch } from "../redux/hooks";

import HomeButton from "../component/button/HomeButton";

export default function Lent() {
  const navigate = useNavigate();
  const [l_idx, setLidx] = useState<number>(0);
  const [isLent, setisLent] = useState<number>(0);
  const [target, setTarget] = useState<number>(-1);
  const [cabiNum, setCabiNum] = useState<number>(-1);

  // const info = useSelector((state :RootState) => state.cabinetReducer);
  // const lent = useSelector((state :RootState) => state.lentReducer);
  //const user = useSelector((state :RootState) => state.userReducer);

  const info = useAppSelector((state) => state.cabinet);
  const lent = useAppSelector((state) => state.lent);
  const user = useAppSelector((state) => state.user);
  
  const dispatch = useAppDispatch();

  useEffect(() => {
    apiCheck();
    if (!info.location) {
      handleClick();
    }
    handleLent();
    // handleEvent();
  }, []);

  const apiCheck = async () => {
    // const url = "/api/check";
    // await axios
    //   .post(url)
    //   .then((res: any) => {
    //     dispatch(userAll(res.data.user));
    //   })
    //   .catch((err: any) => {
    //     console.error(err);
    //     navigate("/");
    //   });
    axiosApiCheck()
      .then((res: any) => {
        dispatch(userAll(res.data.user));
      })
      .catch((err: any) => {
        console.error(err);
        navigate("/");
      });
  };

  // XXX: moved to HomeButton.tsx
  // const handleHome = () => {
  //   navigate(0);
  // };

  const handleLent = () => {
    // const url = "/api/lent_info";
    // axios
    //   .post(url)
    //   .then((res: any) => {
    //     dispatch(lentAll(res.data.lentInfo));
    //     setisLent(res.data.isLent);
    //   })
    //   .catch((err: any) => {
    //     console.error(err);
    //   });
    axiosLentInfo()
      .then((res: any) => {
        dispatch(lentAll(res.data.lentInfo));
        setisLent(res.data.isLent);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const handleClick = () => {
    // const url = "/api/cabinet";
    // axios
    //   .post(url)
    //   .then((res: any) => {
    //     dispatch(cabinetAll(res.data));
    //   })
    //   .catch((err: any) => {
    //     console.error(err);
    //   });
    axiosCabinetInfo()
      .then((res: any) => {
        // TODO: cabinetAll 액션 동작하지 않는 경우 예외처리
        // 프론트와 백엔드 서버가 각기 다른 경우 빈 객체로 받아올 수 있어서 예외처리 필요
        dispatch(cabinetAll(res.data));
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  // const handleEvent = () => {
  //   const url = "/api/event/list"
  //   axios.get(url).then((res:any) => {
  //     setEvent(res.data.eventInfo);
  //   }).catch((err: any) => {console.log(err)});
  // };

  const navTabs = () => {
    let list: Array<JSX.Element> = [];

    if (!info || !info.floor || info.floor.length <= l_idx) {
      return list;
    }
    info.floor[l_idx].forEach((floor: number, idx: number) => {
      list.push(
        <button
          className={`nav-link px-4${idx ? "" : " active"}`}
          id={`nav-tab`}
          key={`nav-${floor}-tab`}
          data-bs-toggle="tab"
          data-bs-target={`#nav-${floor}`}
          type="button"
          role="tab"
          aria-controls={`nav-${floor}`}
          aria-selected={idx ? "false" : "true"}
        >
          {floor}F
        </button>
      );
    });
    return list;
  };
  const navContent = () => {
    let list: Array<JSX.Element> = [];
    if (!info || !info.floor || info.floor.length <= l_idx) {
      return list;
    }
    info.floor[l_idx].forEach((floor: number, idx: number) => {
      list.push(
        <Carousel
          setTarget={setTarget}
          setCabiNum={setCabiNum}
          info={info}
          user={user?.intra_id}
          l_idx={l_idx}
          outer_i={idx}
          outer_lent={lent}
          floor_name={floor}
          isLent={isLent}
          lent={lent}
          key={idx}
        ></Carousel>
      );
    });
    return list;
  };

  return (
    <div className="container col" id="container">
      {/* 이벤트 모달 사용 시 하단 코드활성화 */}
      {/* {localStorage.getItem("eventShown") ? null : <EventModal />} */}
      <div className="row align-items-center">
        <div className="col">
          <div className="px-4">
            {/* <img src="../img/cabinet.ico" onClick={handleHome} width="30" /> */}
            <HomeButton />
          </div>
        </div>
        <div className="col">
          <Location info={info} l_idx={l_idx} setLidx={setLidx} />
        </div>
        <div className="col">
          {/* <Menu url="/return" /> */}
          <MenuButton url="/return" />
        </div>
      </div>
      <div className="row my-2 mx-2">
        <nav>
          <div
            className="nav nav-tabs border-bottom-0"
            id="nav-tabs"
            role="tablist"
          >
            <React.Fragment>{navTabs()}</React.Fragment>
          </div>
        </nav>
        <div className="tab-content" id="nav-tabContent">
          <React.Fragment>{navContent()}</React.Fragment>
        </div>
      </div>
      <div className="text-right">
        <QuestionButton />
      </div>
      <LentModal target={target} cabiNum={cabiNum} />
      <ContentsModal contents="이미 대여중인 사물함이 있어요 :)" />
    </div>
  );
}
