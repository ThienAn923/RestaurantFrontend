// store.js
import { defineStore } from 'pinia';

export const useStore = defineStore({
  id: 'dishTypeStore',
  state: () => ({
    dishTypes: [],
    currentPage: 1,
    pageSize: 5,
  }),
  getters: {
    paginatedDishTypes() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.dishTypes.slice(start, end);
    },
  },
  actions: {
    async fetchDishTypes() {
      const response = await fetch('http://localhost:3000/api/dishTypes');
      const data = await response.json();
      this.dishTypes = data;
    },
    nextPage() {
      if (this.currentPage * this.pageSize < this.dishTypes.length) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  },
});