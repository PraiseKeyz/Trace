'use client'

import { useState } from 'react'
import { Search, Heart, MessageCircle, Share2, Star, Users, TrendingUp, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function CommunityPage() {
  const [tab, setTab] = useState('feed')
  const [liked, setLiked] = useState<number[]>([])

  const toggleLike = (id: number) => {
    setLiked(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  const posts = [
    {
      id: 1,
      author: 'Amara Okafor',
      avatar: '👩',
      handle: '@amara_okafor',
      score: 820,
      time: '2h ago',
      content: 'Just hit my ₦500K savings goal! Thanks to Trace for keeping me accountable. Next target: ₦1M by end of year! 🎯',
      likes: 245,
      comments: 32,
      shares: 18,
      image: '📈'
    },
    {
      id: 2,
      author: 'Marcus Osei',
      avatar: '👨',
      handle: '@marcus_trades',
      score: 715,
      time: '4h ago',
      content: 'The trade intelligence feature just saved me from a bad bulk order. Market analysis showed declining prices. Smart decision!',
      likes: 189,
      comments: 24,
      shares: 12,
      image: '💡'
    },
    {
      id: 3,
      author: 'Blessing Adebayo',
      avatar: '👩',
      handle: '@blessing_biz',
      score: 765,
      time: '6h ago',
      content: 'Started my second business thanks to the credit I got from Trace. Score: 765, Approved Limit: ₦200K. Grateful! 🙏',
      likes: 412,
      comments: 56,
      shares: 34,
      image: '🎉'
    },
  ]

  const topMembers = [
    { name: 'Amara Okafor', handle: '@amara_okafor', score: 920, avatar: '👩', badge: 'Elite' },
    { name: 'Marcus Osei', handle: '@marcus_trades', score: 875, avatar: '👨', badge: 'Pro' },
    { name: 'Blessing Adebayo', handle: '@blessing_biz', score: 845, avatar: '👩', badge: 'Pro' },
    { name: 'Chisom Ezeh', handle: '@chisom_digital', score: 810, avatar: '👨', badge: 'Gold' },
    { name: 'Joy Nwosu', handle: '@joy_entrepreneur', score: 795, avatar: '👩', badge: 'Gold' },
  ]

  const discussions = [
    { title: 'Best practices for growing trade business', replies: 247, views: 3421, category: 'Trading' },
    { title: 'How to optimize your Economic Identity Score', replies: 189, views: 2854, category: 'Score Tips' },
    { title: 'Success stories: From gig worker to business owner', replies: 312, views: 5124, category: 'Inspiration' },
    { title: 'Financial products comparison: Which loan is best?', replies: 156, views: 2301, category: 'Finance' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-trace-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Community</h1>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-trace-border">
            {['feed', 'members', 'discussions'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 font-bold transition ${
                  tab === t
                    ? 'border-b-2 border-trace-primary text-trace-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'feed' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Compose Post */}
              <div className="bg-white rounded-lg p-6 border border-trace-border">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">👤</div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share your success, ask for advice, or discuss with the community..."
                      className="w-full px-4 py-3 bg-trace-surface border border-trace-border rounded-lg resize-none text-foreground placeholder-muted-foreground focus:outline-none focus:border-trace-primary"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-trace-surface rounded-lg transition">📸</button>
                        <button className="p-2 hover:bg-trace-surface rounded-lg transition">🎥</button>
                        <button className="p-2 hover:bg-trace-surface rounded-lg transition">😊</button>
                      </div>
                      <button className="px-6 py-2 bg-trace-primary text-white rounded-lg font-bold hover:bg-trace-primary/90 transition">
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg border border-trace-border overflow-hidden hover:border-trace-primary/50 transition">
                  {/* Post Header */}
                  <div className="p-6 border-b border-trace-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{post.avatar}</span>
                        <div>
                          <p className="font-bold text-foreground">{post.author}</p>
                          <p className="text-xs text-muted-foreground">{post.handle} • Score: {post.score}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{post.time}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-6 py-4">
                    <p className="text-foreground leading-relaxed mb-4">{post.content}</p>
                    {post.image && <div className="text-5xl mb-4">{post.image}</div>}
                  </div>

                  {/* Post Stats */}
                  <div className="px-6 py-3 border-t border-trace-border/50 bg-trace-surface/30 text-xs text-muted-foreground flex justify-between">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>

                  {/* Post Actions */}
                  <div className="px-6 py-4 border-t border-trace-border/50 flex items-center justify-between">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                        liked.includes(post.id)
                          ? 'bg-red-100 text-red-600'
                          : 'text-muted-foreground hover:bg-trace-surface'
                      }`}
                    >
                      <Heart size={18} fill={liked.includes(post.id) ? 'currentColor' : 'none'} /> Like
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:bg-trace-surface transition">
                      <MessageCircle size={18} /> Comment
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-muted-foreground hover:bg-trace-surface transition">
                      <Share2 size={18} /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search community..."
                  className="pl-10 bg-white border-trace-border"
                />
              </div>

              {/* Top Members */}
              <div className="bg-white rounded-lg border border-trace-border p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Award size={20} /> Top Members
                </h3>
                <div className="space-y-3">
                  {topMembers.map((member, idx) => (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b border-trace-border/50 last:border-0 last:pb-0">
                      <span className="text-2xl">{member.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.handle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-trace-primary">Score: {member.score}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            member.badge === 'Elite' ? 'bg-yellow-100 text-yellow-700' :
                            member.badge === 'Pro' ? 'bg-trace-primary/10 text-trace-primary' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {member.badge}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Stats */}
              <div className="bg-white rounded-lg border border-trace-border p-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users size={20} /> Community Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                    <p className="text-2xl font-bold text-trace-primary">50,432</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Posts Today</p>
                    <p className="text-2xl font-bold text-trace-accent">1,234</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Now</p>
                    <p className="text-2xl font-bold text-green-600">428</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-trace-border p-6 text-center hover:border-trace-primary/50 transition cursor-pointer">
                <span className="text-6xl block mb-4">{member.avatar}</span>
                <h3 className="font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{member.handle}</p>
                <div className="flex justify-center gap-2 mb-4">
                  <span className="text-xs px-3 py-1 bg-trace-primary/10 text-trace-primary rounded-full font-bold">Score: {member.score}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    member.badge === 'Elite' ? 'bg-yellow-100 text-yellow-700' :
                    member.badge === 'Pro' ? 'bg-trace-primary/10 text-trace-primary' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {member.badge}
                  </span>
                </div>
                <button className="w-full px-4 py-2 border border-trace-primary text-trace-primary rounded-lg font-bold hover:bg-trace-primary/5 transition">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'discussions' && (
          <div className="bg-white rounded-lg border border-trace-border overflow-hidden">
            <div className="bg-trace-primary text-white px-6 py-4 font-bold">Popular Discussions</div>
            <div className="divide-y divide-trace-border">
              {discussions.map((discussion, idx) => (
                <div key={idx} className="p-6 hover:bg-trace-surface/30 transition cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div>
                      <h3 className="font-bold text-foreground mb-2 hover:text-trace-primary transition">
                        {discussion.title}
                      </h3>
                      <span className="inline-block text-xs px-3 py-1 bg-trace-primary/10 text-trace-primary rounded-full font-bold mb-3">
                        {discussion.category}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        💬 {discussion.replies} replies • 👁️ {discussion.views} views
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


