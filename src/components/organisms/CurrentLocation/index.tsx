import styled from "styled-components";
import dayjs from "dayjs";
import { IoMdPin } from "react-icons/io";
import Skeleton from "react-loading-skeleton";

export default function CurrentLocation({
  city,
  timezoneOffset,
}: {
  city: string;
  timezoneOffset?: number;
}) {
  const isLoading = !timezoneOffset;
  const dateOnCurrentCity =
    timezoneOffset &&
    dayjs().add(timezoneOffset, "second").format("dddd, D [de] MMMM [de] YYYY");
  if (isLoading)
    return <Skeleton count={2} containerClassName="flex-1" width="100%" />;
  return (
    <Container>
      <CityTitle>
        <IoMdPin size={22} />
        {city}
      </CityTitle>
      <DateTitle>{dateOnCurrentCity}</DateTitle>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CityTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 2em;
  text-align: center;
  color: #225bba;
  margin: 0;
`;

const DateTitle = styled.p`
  &::first-letter {
    text-transform: uppercase;
  }
  color: #444;
  font-size: 0.9em;
  text-align: center;
  font-weight: 500;
`;
