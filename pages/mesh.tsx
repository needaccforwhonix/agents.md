import Head from 'next/head';
import { MeshVisualizer } from '../components/AgentMesh/ui/MeshVisualizer';

export default function MeshPage() {
  return (
    <>
      <Head>
        <title>Agent Mesh Broadcast Simulation</title>
        <meta name="description" content="Agent2Agent Broadcast Mesh continuous simulation" />
      </Head>
      <main>
        <MeshVisualizer />
      </main>
    </>
  );
}
