// @ts-nocheck
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart, Bookmark, Share, User, Flag, ChevronRight, MessageSquare, Send } from 'lucide-react'
import MannequinSVG from '@/components/mannequin/MannequinSVG'
import { COLORS_60 } from '@/lib/colors'
import { STYLE_GUIDE } from '@/lib/styles'
import { CATEGORY_NAMES } from '@/lib/categories'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useSocial } from '@/hooks/useSocial'

export default function CommunityDetail() {
  const navigate = useNavigate()
  const { postId } = useParams<{ postId: string }>()
  const { user } = useAuth()
  const { isFollowing, isFriend, toggleFollow } = useSocial()

  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => { if (postId) loadPost() }, [postId])

  const loadPost = async () => {
    try {
      const { data } = await supabase.from('posts')
        .select('*, profiles!posts_user_id_fkey(nickname, avatar_url, instagram_id)')
        .eq('id', postId).single()
      setPost(data)
      // 조회수
      supabase.rpc('increment_view_count', { p_post_id: postId }).catch(() => {})
      // 좋아요 확인
      if (user) {
        const { data: likeData } = await supabase.from('likes').select('id').eq('user_id', user.id).eq('post_id', postId)
        setLiked(!!(likeData && likeData.length > 0))
      }
      // 댓글
      const { data: cmts } = await supabase.from('comments')
        .select('*, profiles:user_id(nickname, avatar_url)')
        .eq('post_id', postId).order('created_at', { ascending: true })
      setComments(cmts || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const toggleLike = async () => {
    if (!user || !postId) return
    const was = liked
    setLiked(!was)
    setPost((p: any) => p ? { ...p, likes_count: p.likes_count + (was ? -1 : 1) } : p)
    try {
      if (was) {
        const { data } = await supabase.from('likes').select('id').eq('user_id', user.id).eq('post_id', postId)
        if (data?.[0]) await supabase.from('likes').delete().eq('id', data[0].id)
      } else {
        await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
        if (post?.user_id !== user.id) {
          supabase.rpc('send_notification', { p_user_id: post.user_id, p_actor_id: user.id, p_type: 'like', p_message: '님이 코디에 ♡를 눌렀어요', p_related_id: postId }).catch(() => {})
        }
      }
    } catch { setLiked(was) }
  }

  const addComment = async () => {
    if (!user || !commentText.trim() || !postId) return
    try {
      const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, content: commentText.trim() })
      if (error) {
        if (error.message?.includes('violates row-level')) alert('맞팔 친구의 게시물에만 댓글을 달 수 있어요')
        else alert('댓글 작성 실패: ' + error.message)
        return
      }
      setCommentText('')
      loadPost()
    } catch (e: any) { alert('오류: ' + e.message) }
  }

  const report = async () => {
    if (!user || !postId) return
    const reason = prompt('신고 사유를 입력해주세요:')
    if (!reason) return
    try {
      const { error } = await supabase.from('reports').insert({ reporter_id: user.id, post_id: postId, reason })
      if (error?.code === '23505') alert('이미 신고한 게시물이에요')
      else if (error) alert('신고 실패')
      else alert('신고가 접수되었어요 📋')
    } catch {}
  }

  if (loading) return <div className="animate-screen-fade px-5 pt-6 text-center py-20 text-sm text-warm-400">불러오는 중...</div>
  if (!post) return <div className="animate-screen-fade px-5 pt-6 text-center py-20 text-sm text-warm-600">게시물을 찾을 수 없어요</div>

  const outfit = post.outfit || {}
  const outfitHex: Record<string, string> = {}
  Object.entries(outfit).forEach(([k, v]) => { if (v) outfitHex[k] = COLORS_60[v as string]?.hex || (v as string) })
  const hasPhoto = post.photo_urls && post.photo_urls.length > 0
  const nick = post.profiles?.nickname || '유저'
  const avatar = post.profiles?.avatar_url
  const styleName = post.style ? STYLE_GUIDE[post.style]?.name : null
  const isMe = user?.id === post.user_id
  const canComment = isFriend(post.user_id) || isMe

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      {/* 사진/마네킹 */}
      {hasPhoto ? (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 hide-scrollbar -mx-5 px-5">
          {post.photo_urls.map((url: string, i: number) => (
            <img key={i} src={url} className="w-72 h-96 rounded-2xl object-contain bg-warm-100 flex-shrink-0" alt="" />
          ))}
        </div>
      ) : Object.keys(outfitHex).length > 0 && (
        <div className="flex justify-center py-6 bg-warm-100 rounded-2xl mb-4">
          <MannequinSVG outfit={outfitHex} size={180} />
        </div>
      )}

      {/* 액션 바 */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={toggleLike} className="flex items-center gap-1.5 active:scale-110 transition-transform">
          <Heart size={22} fill={liked ? '#FF6B6B' : 'none'} stroke={liked ? '#FF6B6B' : '#57534E'} strokeWidth={2} className={liked ? 'animate-like-bounce' : ''} />
          {!post.hide_counts && <span className={`text-sm font-semibold ${liked ? 'text-[#FF6B6B]' : 'text-warm-800'}`}>{post.likes_count || 0}</span>}
        </button>
        <button className="flex items-center gap-1.5"><MessageSquare size={20} className="text-warm-700" /><span className="text-sm text-warm-600">{comments.length}</span></button>
        <div className="flex-1" />
        <button className="active:scale-90 transition-transform"><Share size={20} className="text-warm-700" /></button>
        {!isMe && <button onClick={report} className="active:scale-90 transition-transform"><Flag size={18} className="text-warm-500" /></button>}
      </div>

      {/* 작성자 */}
      <div className="flex items-center gap-3 mb-4">
        <div onClick={() => navigate(`/user/${post.user_id}`)} className="flex items-center gap-2.5 cursor-pointer flex-1">
          {avatar ? <img src={avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
          : <div className="w-9 h-9 rounded-full bg-terra-100 flex items-center justify-center"><User size={16} className="text-terra-600" /></div>}
          <div>
            <div className="text-sm font-semibold text-warm-900">@{nick}</div>
            {post.show_instagram && post.profiles?.instagram_id && <div className="text-[10px] text-warm-500">📸 {post.profiles.instagram_id}</div>}
          </div>
        </div>
        {!isMe && user && (
          <button onClick={() => toggleFollow(post.user_id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold active:scale-95 transition-all ${isFollowing(post.user_id) ? 'bg-warm-200 text-warm-700 border border-warm-400' : 'bg-terra-500 text-white shadow-terra'}`}>
            {isFollowing(post.user_id) ? '팔로잉 ✓' : '팔로우'}
          </button>
        )}
      </div>

      {/* 캡션 + 태그 */}
      {(post.caption || post.title) && <div className="text-sm text-warm-800 mb-3 leading-relaxed">{post.caption || post.title}</div>}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {styleName && <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-terra-100 text-terra-700">{styleName}</span>}
        {post.score > 0 && <span className="font-display text-[11px] font-bold px-2.5 py-1 rounded-full bg-warm-900 text-white">{post.score}점</span>}
      </div>

      {/* 컬러 정보 */}
      {Object.keys(outfit).length > 0 && (
        <div className="bg-white border border-warm-400 rounded-2xl p-3 mb-5 shadow-warm-sm">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(outfit).filter(([_, v]) => v).map(([part, ck]) => {
              const c = COLORS_60[ck as string]
              if (!c) return null
              return (
                <div key={part} className="flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded border border-warm-400" style={{ background: c.hex }} />
                  <span className="text-warm-500">{(CATEGORY_NAMES as any)?.[part]}</span>
                  <span className="text-warm-800">{c.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 댓글 */}
      <div className="border-t border-warm-300 pt-4">
        <div className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-3">댓글 {comments.length}</div>
        {comments.map(c => (
          <div key={c.id} className="flex items-start gap-2.5 mb-3">
            {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} className="w-7 h-7 rounded-full object-cover mt-0.5" alt="" />
            : <div className="w-7 h-7 rounded-full bg-warm-200 flex items-center justify-center mt-0.5"><User size={12} className="text-warm-500" /></div>}
            <div>
              <span className="text-xs font-semibold text-warm-900">@{c.profiles?.nickname || '유저'}</span>
              <div className="text-sm text-warm-800 mt-0.5">{c.content}</div>
            </div>
          </div>
        ))}
        {canComment && user ? (
          <div className="flex gap-2 mt-3">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()}
              placeholder="댓글 작성..." className="flex-1 px-3 py-2.5 bg-warm-100 border border-warm-400 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:border-terra-400" />
            <button onClick={addComment} className="w-10 h-10 rounded-xl bg-terra-500 flex items-center justify-center active:scale-90 transition-transform">
              <Send size={16} color="#fff" />
            </button>
          </div>
        ) : user && !isMe ? (
          <div className="text-xs text-warm-500 text-center py-3">맞팔 친구만 댓글을 작성할 수 있어요</div>
        ) : null}
      </div>
    </div>
  )
}
