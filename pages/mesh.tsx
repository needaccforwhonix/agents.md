import Head from 'next/head';
import AgentMesh from '../components/AgentMesh/ui/AgentMesh';

export default function MeshPage() {
  return (
    <>
      <Head>
        <title>Agent Mesh Simulation - agents.md</title>
        <meta name="description" content="Agent2Agent Mesh Simulation Platform" />
      </Head>
      <main className="min-h-screen bg-gray-900">
        <AgentMesh />
      </main>
    </>
  );
}
