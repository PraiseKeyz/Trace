'use client'

import React, { useState } from 'react'

import { OpportunityCard } from '@/components/OpportunityCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, MapPin, Briefcase } from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  skill: string
  location: string
  payRange: string
  matchPercentage: number
  company?: string
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Product Display & Sales',
    skill: 'Sales & Trading',
    location: 'Mainland Lagos',
    payRange: '₦15,000 - ₦25,000/day',
    matchPercentage: 95,
    company: 'FreshMart Distribution',
  },
  {
    id: '2',
    title: 'Last-Mile Delivery',
    skill: 'Delivery & Logistics',
    location: 'Lagos Island',
    payRange: '₦12,000 - ₦20,000/day',
    matchPercentage: 87,
    company: 'Swift Logistics',
  },
  {
    id: '3',
    title: 'Product Demonstration',
    skill: 'Sales & Trading',
    location: 'Ikoyi, Lagos',
    payRange: '₦18,000 - ₦30,000/day',
    matchPercentage: 92,
    company: 'Consumer Goods Co',
  },
  {
    id: '4',
    title: 'Market Research Assistant',
    skill: 'Services',
    location: 'Yaba, Lagos',
    payRange: '₦10,000 - ₦15,000/day',
    matchPercentage: 78,
    company: 'Market Research Inc',
  },
  {
    id: '5',
    title: 'Food Delivery (Premium Zone)',
    skill: 'Delivery & Logistics',
    location: 'Victoria Island',
    payRange: '₦20,000 - ₦35,000/day',
    matchPercentage: 85,
    company: 'Food Express',
  },
  {
    id: '6',
    title: 'Artisan Product Promotion',
    skill: 'Sales & Trading',
    location: 'Lekki, Lagos',
    payRange: '₦16,000 - ₦28,000/day',
    matchPercentage: 88,
    company: 'Artisan Network',
  },
]

export default function WorkMatcherPage() {
  const [filteredSkill, setFilteredSkill] = useState<string>('')
  const [filteredLocation, setFilteredLocation] = useState<string>('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null)

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter((opp) => {
    const matchesSkill = !filteredSkill || opp.skill === filteredSkill
    const matchesLocation = !filteredLocation || opp.location.includes(filteredLocation)
    return matchesSkill && matchesLocation
  })

  const uniqueSkills = Array.from(new Set(MOCK_OPPORTUNITIES.map((opp) => opp.skill)))
  const uniqueLocations = Array.from(
    new Set(MOCK_OPPORTUNITIES.map((opp) => opp.location.split(',')[0]))
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-trace-primary mb-2">
          Work Matcher
        </h1>
        <p className="text-gray-600">
          Discover opportunities matched to your skills and location
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 rounded-lg border border-trace-border bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-trace-primary" />
          <h2 className="text-lg font-semibold text-trace-text">Filters</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Skill Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Skill Type
            </label>
            <Select value={filteredSkill} onValueChange={setFilteredSkill}>
              <SelectTrigger>
                <SelectValue placeholder="All Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Skills</SelectItem>
                {uniqueSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Location
            </label>
            <Select value={filteredLocation} onValueChange={setFilteredLocation}>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Search
            </label>
            <Input placeholder="Job title..." />
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilteredSkill('')
                setFilteredLocation('')
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredOpportunities.length}</span> opportunities
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            onClick={() => setSelectedOpportunity(opportunity.id)}
            className={`transition-all ${selectedOpportunity === opportunity.id ? 'ring-2 ring-trace-primary' : ''}`}
          >
            <OpportunityCard {...opportunity} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-trace-border bg-gray-50 py-12">
          <Briefcase className="h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700">No opportunities found</h3>
          <p className="text-sm text-gray-600">Try adjusting your filters</p>
        </div>
      )}

      {/* Selected Opportunity Detail */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            {(() => {
              const opp = MOCK_OPPORTUNITIES.find((o) => o.id === selectedOpportunity)
              return (
                opp && (
                  <>
                    <h2 className="text-2xl font-bold text-trace-primary mb-4">{opp.title}</h2>
                    <div className="space-y-3 mb-6">
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-semibold text-trace-text">{opp.company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Skill Required</p>
                        <p className="font-semibold text-trace-text">{opp.skill}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-semibold text-trace-text">{opp.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pay Range</p>
                          <p className="font-semibold text-trace-text">{opp.payRange}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOpportunity(null)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button className="flex-1 bg-trace-primary hover:bg-trace-primary/90">
                        Apply Now
                      </Button>
                    </div>
                  </>
                )
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

