import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="px-6 py-12 text-center text-sm text-gray-600 dark:text-gray-400 mt-24 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800">
      <p>
        Copyright © AGENTS.md a Series of LF Projects, LLC
        <br />
        For web site terms of use, trademark policy and other project policies please see{" "}
        <a href="https://lfprojects.org" target="_blank" className="underline hover:no-underline">
          https://lfprojects.org
        </a>
        .
      </p>
      <div className="mt-4 text-xs text-gray-400">
        <Link href="/mesh" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          Agent Mesh Simulation
        </Link>
      </div>
    </footer>
  );
}
