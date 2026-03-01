import Head from 'next/head';
import { MeshDashboard } from '../components/AgentMesh/ui/MeshDashboard';

export default function MeshPage() {
  return (
    <>
      <Head>
        <title>A2A Mesh Dashboard - agents.md</title>
        <meta name="description" content="Agent2Agent Mesh Architecture Simulation" />
      </Head>
      <MeshDashboard />
    </>
  );
}
