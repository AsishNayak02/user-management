import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <span className="">
        <Link href="/login" className="underline text-blue-800">Click here</Link>
        &nbsp;to go to Login Page
      </span>
    </div>
  );
}
