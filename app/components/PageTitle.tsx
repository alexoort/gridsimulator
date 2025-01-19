"use client";

import { useEffect } from "react";

interface PageTitleProps {
  title: string;
}

export default function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    // Update the document title when the component mounts
    document.title = `${title} | Grid Simulator`;

    // Optionally restore the original title when the component unmounts
    return () => {
      document.title = "Grid Simulator - Power Grid Management Game";
    };
  }, [title]);

  // This component doesn't render anything
  return null;
}
