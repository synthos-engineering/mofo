'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Clock, MapPin, ChevronDown, Shield } from 'lucide-react'

interface DateProposalProps {
  onBack: () => void
  onSendProposal: () => void
}

const timeSlots = [
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'
]

const venueTypes = [
  { id: 'coffee', name: 'Coffee Shop', icon: '☕' },
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
  { id: 'art-gallery', name: 'Art Gallery Cafe', icon: '🎨' },
  { id: 'park', name: 'Park Cafe', icon: '🌳' },
  { id: 'bookstore', name: 'Bookstore Cafe', icon: '📚' },
]

export function DateProposal({ onBack, onSendProposal }: DateProposalProps) {
  const [selectedDate, setSelectedDate] = useState(30)
  const [selectedTime, setSelectedTime] = useState('7:00 PM')
  const [selectedVenue, setSelectedVenue] = useState('art-gallery')
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showVenueDropdown, setShowVenueDropdown] = useState(false)

  const currentMonth = 'September 2025'
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1)
  
  // Get last few days of previous month and first few days of next month for calendar view
  const prevMonthDays = [31]
  const nextMonthDays = [1, 2, 3, 4]

  const selectedVenueData = venueTypes.find(v => v.id === selectedVenue)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-sm text-gray-500">
        <span>W-16: Propose Date</span>
        <div className="flex space-x-2">
          <button className="p-1">←</button>
          <button className="p-1">→</button>
        </div>
      </div>

      {/* Back Button */}
      <div className="px-6 pt-4">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span>Propose Date</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 pb-6 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-800 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plan Your Coffee Date</h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">
            Your agent will coordinate with Elena's agent to arrange the perfect meetup
          </p>
        </div>

        {/* Safety First */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800 mb-1">Safety First</div>
              <div className="text-sm text-blue-700">
                Always meet in public places. Share your plans with friends. Trust your instincts.
              </div>
            </div>
          </div>
        </div>

        {/* Choose Date */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Choose Date</span>
          </div>

          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold">{currentMonth}</h3>
            <button className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-2 font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous month days */}
            {prevMonthDays.map(day => (
              <button key={`prev-${day}`} className="h-10 text-gray-300 text-sm hover:bg-gray-50 rounded">
                {day}
              </button>
            ))}

            {/* Current month days */}
            {daysInMonth.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`h-10 text-sm rounded transition-colors ${
                  selectedDate === day
                    ? 'bg-black text-white'
                    : day === 30
                    ? 'bg-gray-900 text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            ))}

            {/* Next month days */}
            {nextMonthDays.map(day => (
              <button key={`next-${day}`} className="h-10 text-gray-300 text-sm hover:bg-gray-50 rounded">
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Preferred Time</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
            >
              <span>{selectedTime}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showTimeDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedTime(time)
                      setShowTimeDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Venue Type */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Venue Type</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowVenueDropdown(!showVenueDropdown)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedVenueData?.icon}</span>
                <span>{selectedVenueData?.name}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showVenueDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
                {venueTypes.map(venue => (
                  <button
                    key={venue.id}
                    onClick={() => {
                      setSelectedVenue(venue.id)
                      setShowVenueDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-2"
                  >
                    <span className="text-lg">{venue.icon}</span>
                    <span>{venue.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Proposal Preview */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <h3 className="font-medium text-green-800 mb-3">Date Proposal Preview</h3>
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>📅 30/09/2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>🕰️ {selectedTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{selectedVenueData?.icon} {selectedVenueData?.name}</span>
            </div>
          </div>
        </div>

        {/* Send Proposal Button */}
        <button
          onClick={onSendProposal}
          className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg"
        >
          Send Proposal to Elena's Agent
        </button>
      </div>
    </div>
  )
}
