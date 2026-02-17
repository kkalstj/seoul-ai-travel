'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Trash2, Share2, ChevronRight, Calendar } from 'lucide-react';
import { getMyCourses, deleteCourse, createCourse } from '@/lib/supabase/courses';

interface Course {
  id: string;
  title: string;
  description: string | null;
  share_id: string;
  total_places: number;
  created_at: string;
  updated_at: string;
}

export default function MyTripPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await getMyCourses();
      setCourses(data || []);
    } catch (err) {
      console.error('코스 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCourse() {
    if (!newTitle.trim()) return;
    try {
      const course = await createCourse(newTitle.trim());
      setNewTitle('');
      setShowNewForm(false);
      router.push('/my-trip/' + course.id);
    } catch (err) {
      console.error('코스 생성 실패:', err);
    }
  }

  async function handleDeleteCourse(courseId: string) {
    if (!confirm('이 코스를 삭제하시겠습니까?')) return;
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(function(c) { return c.id !== courseId; }));
    } catch (err) {
      console.error('코스 삭제 실패:', err);
    }
  }

  function handleShare(shareId: string) {
    var url = window.location.origin + '/shared/' + shareId;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    setTimeout(function() { setCopiedId(null); }, 2000);
  }

  function formatDate(dateStr: string) {
    var date = new Date(dateStr);
    return date.getFullYear() + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' + String(date.getDate()).padStart(2, '0');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">나의 여행</h1>
        <button
          onClick={function() { setShowNewForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          새 코스
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border">
          <input
            type="text"
            value={newTitle}
            onChange={function(e) { setNewTitle(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleCreateCourse(); }}
            placeholder="코스 이름을 입력하세요"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={function() { setShowNewForm(false); setNewTitle(''); }}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              취소
            </button>
            <button
              onClick={handleCreateCourse}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              만들기
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">저장된 여행 코스가 없어요</p>
          <p className="text-gray-400 text-sm mb-6">AI 추천을 저장하거나 직접 코스를 만들어보세요</p>
          <button
            onClick={function() { setShowNewForm(true); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            첫 코스 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(function(course) {
            return (
              <div key={course.id} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={function() { router.push('/my-trip/' + course.id); }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    {course.description && (
                      <p className="text-sm text-gray-500 mb-2">{course.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(course.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={function(e) { e.stopPropagation(); handleShare(course.share_id); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="공유 링크 복사"
                    >
                      {copiedId === course.share_id ? (
                        <span className="text-xs text-green-500 font-medium">복사됨!</span>
                      ) : (
                        <Share2 size={16} />
                      )}
                    </button>
                    <button
                      onClick={function(e) { e.stopPropagation(); handleDeleteCourse(course.id); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
