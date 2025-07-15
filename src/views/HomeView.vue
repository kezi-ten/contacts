<template>
  <div class="home">
    <h1>你好，{{ username }}</h1>

    <div v-for="(dept, index) in departments" :key="index" class="department">
      <div class="dept-header" @click="toggle(dept.name)">
        {{ dept.name }} (共 {{ dept.employees.length }} 人)
        <span>{{ dept.isOpen ? '▼' : '▶' }}</span>
      </div>
      <transition name="slide">
        <div v-show="dept.isOpen" class="employee-list">
          <ul>
            <li v-for="emp in dept.employees" :key="emp.id">{{ emp.name }}</li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomeView',
  data() {
    return {
      username: '',
      departments: [],
      isOpenMap: {} // 控制每个部门是否展开
    };
  },
  mounted() {
    this.username = localStorage.getItem('username') || '游客';
    this.fetchEmployees();
  },
  methods: {
    async fetchEmployees() {
      try {
        const response = await axios.get('http://localhost:8082/employees');
        this.groupByDepartment(response.data);
      } catch (error) {
        console.error('请求员工数据失败:', error);
      }
    },
    groupByDepartment(employees) {
      const map = {};
      employees.forEach(emp => {
        if (!map[emp.department]) {
          map[emp.department] = [];
        }
        map[emp.department].push(emp);
      });

      this.departments = Object.keys(map).map(deptName => ({
        name: deptName,
        employees: map[deptName],
        isOpen: false
      }));
    },
    toggle(deptName) {
      const dept = this.departments.find(d => d.name === deptName);
      if (dept) {
        dept.isOpen = !dept.isOpen;
      }
    }
  }
};
</script>

<style scoped>
.home {
  padding: 2rem;
}

.department {
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.dept-header {
  background-color: #f5f7fa;
  padding: 1rem;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-list ul {
  list-style-type: none;
  padding-left: 1rem;
  margin: 0;
}

.employee-list li {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}

.employee-list li:last-child {
  border-bottom: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.3s ease-out;
  max-height: 200px;
}
.slide-enter,
.slide-leave-to {
  max-height: 0;
  overflow: hidden;
}
</style>