import React from 'react';
import Head from 'next/head';
import { MeshViewer } from '../components/AgentMesh/ui/MeshViewer';

export default function MeshPage() {
  return (
    <>
      <Head>
        <title>Agent Mesh Simulation</title>
        <meta name="description" content="Agent2Agent Mesh Architecture Simulation" />
      </Head>
      <main>
        <MeshViewer />
      </main>
    </>
  );
}
