import Loader from "@/components/Loader";

export default function SubRouteLoading({ label = "Loading..." }: { label?: string }) {
  return <Loader label={label} />;
}
