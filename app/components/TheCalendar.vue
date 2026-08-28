<script setup>
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import { computed } from "vue";

import { useMatches2Store } from "../stores/matches2";

import { useModalStore } from "@/stores/modal";

import { storeToRefs } from "pinia";
import { ref } from "vue";

const { closeModal } = useModalStore();

const { getMatches, emptyMatches, setCalendarIsPending } = useMatches2Store();

const { setDay, setResource } = useSportsQueryParamsStore();
const { day: selected } = storeToRefs(useSportsQueryParamsStore());

async function fetchMatchesByDate(date) {
  emptyMatches();
  setResource("");
  setDay(date);
  setCalendarIsPending(true);
  await getMatches();
  setCalendarIsPending(false);
  closeModal();
}

function generateFourMonthCalendar() {
  const calendar = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  for (let i = 0; i < 4; i++) {
    const monthIndex = (currentMonth + i) % 12;
    const year = currentMonth + i >= 12 ? currentYear + 1 : currentYear;

    const weeks = getWeeksInMonth(year, monthIndex);

    calendar.push({
      year,
      monthIndex,
      month: monthNames[monthIndex],
      days: weeks,
    });
  }

  return calendar;
}

function getWeeksInMonth(year, month) {
  const weeks = [];
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let weekStart = 1 - firstDayOfMonth;
  let weekEnd = weekStart + 6;

  while (weekStart <= daysInMonth) {
    const week = [];
    for (let i = weekStart; i <= weekEnd && i <= daysInMonth; i++) {
      week.push(i > 0 ? i : null);
    }
    weeks.push(week);
    weekStart += 7;
    weekEnd += 7;
  }

  return weeks;
}

const calendarData = computed(() => generateFourMonthCalendar());

const currentIndex = ref(0);

function isBeforeToday(year, month, day) {
  const today = new Date();
  const givenDate = new Date(year, month, day);

  // Set time to 00:00:00 for both dates
  today.setHours(0, 0, 0, 0);
  givenDate.setHours(0, 0, 0, 0);

  return givenDate < today;
}

function isSelectedDate(year, month, day) {
  const date = new Date(selected.value);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

function reduceCurrentIndex() {
  if (currentIndex.value <= 0) {
    currentIndex.value = 0;
    return;
  }
  currentIndex.value -= 1;
}

function increaseCurrentIndex() {
  if (currentIndex.value >= 3) {
    currentIndex.value = 3;
    return;
  }
  currentIndex.value += 1;
}

function prependZero(number) {
  return number < 10 ? `0${number}` : number;
}

function selectDate(day) {
  if (
    isBeforeToday(
      calendarData.value[currentIndex.value].year,
      calendarData.value[currentIndex.value].monthIndex,
      day
    )
  ) {
    return;
  }
  const selectedDay = day;
  const selectedDate = `${
    calendarData.value[currentIndex.value].year
  }-${prependZero(
    calendarData.value[currentIndex.value].monthIndex + 1
  )}-${prependZero(selectedDay)}`;
  fetchMatchesByDate(selectedDate);
  closeModal();
}
</script>
<template>
  <div
    v-if="calendarData[0]"
    class="flex items-center justify-center dark:bg-surface-interactive bg-white py-3 px-2"
  >
    <div class="max-w-md w-full">
      <div>
        <div class="flex items-center justify-between px-1">
          <span
            tabindex="0"
            class="focus:outline-hidden text-base font-bold dark:text-gray-100 text-gray-800"
            >{{ calendarData[currentIndex].month }} 2025</span
          >
          <div class="flex items-center">
            <button
              aria-label="calendar backward"
              class="focus:text-gray-400 hover:text-gray-400 text-gray-800 dark:text-gray-100"
              @click="reduceCurrentIndex()"
            >
              <Icon name="tabler:chevron-left" class="w-6 h-6" aria-hidden="true" /></button
            ><button
              aria-label="calendar forward"
              class="focus:text-gray-400 hover:text-gray-400 ml-3 text-gray-800 dark:text-gray-100"
              @click="increaseCurrentIndex()"
            >
              <Icon name="tabler:chevron-right" class="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between pt-4 overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th>
                  <div class="w-full flex justify-center">
                    <p
                      class="text-base font-medium text-center text-gray-800 dark:text-gray-100"
                    >
                      Sun
                    </p>
                  </div>
                </th>
                <th>
                  <div class="w-full flex justify-center">
                    <p
                      class="text-base font-medium text-center text-gray-800 dark:text-gray-100"
                    >
                      Mon
                    </p>
                  </div>
                </th>
                <th>
                  <div class="w-full flex justify-center">
                    <p
                      class="text-base font-medium text-center text-gray-800 dark:text-gray-100"
                    >
                      Tue
                    </p>
                  </div>
                </th>
                <th>
                  <div class="w-full flex justify-center">
                    <p
                      class="text-base font-medium text-center text-gray-800 dark:text-gray-100"
                    >
                      Wed
                    </p>
                  </div>
                </th>
                <th>
                  <div class="w-full flex justify-center">
                    <p
                      class="text-base font-medium text-center text-gray-800 dark:text-gray-100"
                    >
                      Thu
                    </p>
                  </div>
                </th>
                <th>
                  <div class="w-full flex justify-center">
                    <p
                      class="text-base font-medium text-center text-gray-800 dark:text-gray-100"
                    >
                      Fri
                    </p>
                  </div>
                </th>
                <th>
                  <div class="w-full flex justify-center">
                    <p
                      class="text-base font-medium text-center text-gray-800 dark:text-gray-100"
                    >
                      Sat
                    </p>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr
                v-for="(week, index1) in calendarData[currentIndex].days"
                :key="JSON.stringify(week) + index1"
              >
                <td
                  v-for="(day, index) in week"
                  :key="JSON.stringify(day) + index"
                  class="pt-2"
                  @click="selectDate(day)"
                >
                  <div>
                    <button
                      type="button"
                      :class="[
                        'w-full flex justify-center',
                        isSelectedDate(
                          calendarData[currentIndex].year,
                          calendarData[currentIndex].monthIndex,
                          day
                        )
                          ? 'bg-brand-mid'
                          : '',
                        isBeforeToday(
                          calendarData[currentIndex].year,
                          calendarData[currentIndex].monthIndex,
                          day
                        )
                          ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : 'cursor-pointer dark:text-gray-200',
                      ]"
                      class="px-2 py-2 rounded-full flex w-full justify-center hover:bg-background hover:text-gray-400"
                    >
                      {{ day }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
