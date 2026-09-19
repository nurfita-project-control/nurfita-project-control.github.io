import ProjectControl from "./project-control";

export default function Home() {
  return (
    <ProjectControl
      user={{
        name: "Pengguna Demo",
        email: "Akses produksi melalui Supabase",
        role: "Project Control & Administration",
      }}
    />
  );
}
