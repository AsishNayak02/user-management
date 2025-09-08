"use client"; 
import { useAppSelector } from "@/redux/hooks/redux.hooks";

export default function Page() {
  const userName = useAppSelector((state) => state.auth.name);
  return (
    <div>
      Hi, I am <span>{userName}</span>
    </div>
  )
}
