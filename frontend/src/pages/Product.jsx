import React from "react";
import { useSearchParams } from "react-router-dom";

export default function Product() {
  const [searchParams] = useSearchParams();
  console.log(searchParams);
  return <div>Product {searchParams.get("id")}</div>;
}
