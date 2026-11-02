import HomePage from "../../_components/site-app";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return <HomePage initialView="PublicProfile" initialProfileUsername={username} />;
}