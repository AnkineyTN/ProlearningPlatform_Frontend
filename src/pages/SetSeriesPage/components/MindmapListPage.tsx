import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MindmapCard from "@/components/cards/MindmapCard";
import { Button } from "@/components/ui/button";

export default function MindmapListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const mindmaps = [
    {
      id: 1,
      title: "OOP Interview Question",
      category: "20 Sep 2025",
      preview:
        "Supervised learning is a machine learning method in which an algorithm learns from...",
      time: "2 hours ago",
      date: "16 Sep 2025",
    },
    {
      id: 2,
      title: "Stack and Queue",
      category: "15 Sep 2025",
      preview:
        "Stack is a LIFO (Last In First Out) data structure, while Queue is FIFO (First In Fir...",
      time: "2 hours ago",
      date: "16 Sep 2025",
    },
    {
      id: 3,
      title: "Supervised Learning Algo...",
      category: "01 Sep 2025",
      preview:
        "Supervised learning is a machine learning method in which an algorithm learns from...",
      time: "2 hours ago",
      date: "16 Sep 2025",
    },
    {
      id: 4,
      title: "Supervised Learning Algo...",
      category: "10 Aug 2025",
      preview:
        "Supervised learning is a machine learning method in which an algorithm learns from...",
      time: "2 hours ago",
      date: "16 Sep 2025",
    },
    {
      id: 5,
      title: "Stack and Queue",
      category: "22 Jul 2025",
      preview:
        "Stack is a LIFO (Last In First Out) data structure, while Queue is FIFO (First In Fir...",
      time: "2 hours ago",
      date: "16 Sep 2025",
    },
    {
      id: 6,
      title: "Supervised Learning Algo...",
      category: "20 Jun 2025",
      preview:
        "Supervised learning is a machine learning method in which an algorithm learns from...",
      time: "2 hours ago",
      date: "16 Sep 2025",
    },
  ];

  const totalPages = 5;

  const handleAccess = (id: string) => {
    navigate(`/mindmap/${id}`);
  };

  return (
    <div>
      {/* mindmaps Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {mindmaps.map((mindmap) => (
          <MindmapCard
            key={mindmap.id}
            mindmap={mindmap}
            onAccess={handleAccess}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className='flex justify-center items-center gap-4'>
        <Button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className='p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        >
          <span className='text-gray-700'>‹</span>
        </Button>

        <span className='text-sm font-medium text-gray-700'>
          {currentPage}/{totalPages}
        </span>

        <Button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        >
          <span className='text-gray-700'>›</span>
        </Button>
      </div>
    </div>
  );
}
