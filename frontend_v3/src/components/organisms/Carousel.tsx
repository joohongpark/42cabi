import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import SlideContainer from "./SlideContainer";
import SlideButton from "../atoms/buttons/SlideButton";
import SectionButton from "../atoms/buttons/SectionButton";
import SectionNameButton from "../atoms/buttons/SectionNameButton";
import { CabinetInfoByLocationFloorDto } from "../../types/dto/cabinet.dto";

const CarouselComponent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  margin: 0;
`;
const CarouselArea = styled.div`
  width: 270px;
  @media (max-width: 281px) {
    width: 195px;
  }
  height: 100%;
  margin: 0;
  overflow: hidden;
`;

const SectionNameArea = styled.div`
  display: flex;
  align-items: center;
  height: 2rem;
`;

const SectionButtonArea = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: between-space;
  align-items: center;
  height: 2rem;
`;

const RowDiv = styled.div`
  display: flex;
  height: calc(100% - 4rem);
  flex-direction: row;
  align-items: center;
`;

interface CarouselProps {
  slideCount: number | undefined;
  cabinets: CabinetInfoByLocationFloorDto[] | undefined;
  sections: string[];
}

const Carousel = (props: CarouselProps): JSX.Element => {
  const { slideCount, cabinets, sections } = props;
  const [mouseDownClientX, setMouseDownClientX] = useState(0);
  const [mouseDownClientY, setMouseDownClientY] = useState(0);
  const [mouseUpClientX, setMouseUpClientX] = useState(0);
  const [mouseUpClientY, setMouseUpClientY] = useState(0);
  const [tochedX, setTochedX] = useState(0);
  const [tochedY, setTochedY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef<HTMLInputElement>(null);

  const lastSlide = slideCount || 0;

  useEffect(() => {
    setCurrentSlide(0);
  }, [cabinets]);

  useEffect(() => {
    if (slideRef.current != null) {
      slideRef.current.style.transition = "transform 0.5s ease-in-out";
      slideRef.current.style.transform = `translateX(-${
        (currentSlide * 100) / (lastSlide + 1)
      }%)`;
    }
  }, [currentSlide]);

  useEffect(() => {
    const dragSpaceX = Math.abs(mouseDownClientX - mouseUpClientX);
    const dragSpaceY = Math.abs(mouseDownClientY - mouseUpClientY);
    const vector = dragSpaceX / dragSpaceY;

    if (dragSpaceX > 100 && vector > 2) {
      if (mouseUpClientX < mouseDownClientX) {
        if (currentSlide === lastSlide) setCurrentSlide(0);
        else setCurrentSlide(currentSlide + 1);
      } else if (mouseUpClientX > mouseDownClientX) {
        if (currentSlide === 0) setCurrentSlide(lastSlide);
        else setCurrentSlide(currentSlide - 1);
      }
    }
  }, [mouseUpClientX]);

  const onMouseDown = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    setMouseDownClientX(e.clientX);
    setMouseDownClientY(e.clientY);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    setMouseUpClientX(e.clientX);
    setMouseUpClientY(e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent): void => {
    setTochedX(e.changedTouches[0].pageX);
    setTochedY(e.changedTouches[0].pageY);
  };

  const onTouchEnd = (e: React.TouchEvent): void => {
    const distanceX = tochedX - e.changedTouches[0].pageX;
    const distanceY = tochedY - e.changedTouches[0].pageY;
    const vector = Math.abs(distanceX / distanceY);

    if (distanceX > 30 && vector > 2) {
      if (currentSlide === lastSlide) setCurrentSlide(0);
      else setCurrentSlide(currentSlide + 1);
    } else if (distanceX < -30 && vector > 2) {
      if (currentSlide === 0) setCurrentSlide(lastSlide);
      else setCurrentSlide(currentSlide - 1);
    }
  };

  const renderSectionButtons = (): JSX.Element[] => {
    const sectionButtons: JSX.Element[] = [];
    for (let i = 0; i <= lastSlide; i += 1) {
      sectionButtons.push(
        <SectionButton
          key={i}
          index={i}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
      );
    }
    return sectionButtons;
  };

  return (
    <CarouselComponent>
      <SectionNameArea>
        <SectionNameButton
          sections={sections}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
      </SectionNameArea>
      <SectionButtonArea>{renderSectionButtons()}</SectionButtonArea>
      <RowDiv>
        <SlideButton
          direction="left"
          lastSlide={lastSlide}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
        <CarouselArea
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <SlideContainer
            sections={sections}
            slideRef={slideRef}
            slideCount={slideCount ? slideCount + 1 : slideCount}
            cabinets={cabinets}
            setCurrentSlide={setCurrentSlide}
          />
        </CarouselArea>
        <SlideButton
          direction="right"
          lastSlide={lastSlide}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
      </RowDiv>
    </CarouselComponent>
  );
};

export default Carousel;
