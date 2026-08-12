import React from "react";

const BookingCostPreview = ({ room, dateRange }) => {
  if (!room || !dateRange) return null;

  const nights = dateRange[1].diff(dateRange[0], "day");

  if (nights <= 0) return null;

  const total = nights * room.price;

  return (
    <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
      <div className="flex justify-between">
        <span className="text-gray-600">Room Price</span>

        <span className="font-medium">₹{room.price}/day</span>
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-gray-600">Days</span>

        <span>{nights}</span>
      </div>

      <hr className="my-3" />

      <div className="flex justify-between">
        <span className="font-semibold">Total Cost</span>

        <span className="font-bold text-[#C76A34] text-lg">₹{total}</span>
      </div>
    </div>
  );
};

export default BookingCostPreview;
