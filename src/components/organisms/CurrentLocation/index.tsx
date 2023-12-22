import styled from "styled-components";
import { IoMdLocate } from "react-icons/io";
import { useAppSelector } from "@/hooks";
import { selectGeolocation } from "@/store/GeolocationSlice";
import Skeleton from "react-loading-skeleton";

const CityTitle = styled.h1`
  font-family: "Roboto", sans-serif;
  font-size: 2em;
  text-align: center;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

export default function CurrentLocation() {
  const geolocation = useAppSelector(selectGeolocation);
  return (
    <CityTitle>
      <IoMdLocate size={24} />
      {geolocation ? geolocation.city : <Skeleton width={100} height={24} />}
    </CityTitle>
  );
}
