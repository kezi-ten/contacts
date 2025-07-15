<!-- src/layouts/DefaultLayout.vue -->
<template>
  <div class="default-layout">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="container">
        <h1 class="logo">员工通讯录系统</h1>
      </div>
    </nav>

    <!-- 页面内容展示 -->
    <main class="content container flex-grow">
      <!-- 中央登录入口按钮 -->
      <div class="hero-section">
        <h2 class="hero-title">欢迎使用员工通讯录系统</h2>
        <p class="hero-subtitle">快速查找 · 高效管理 · 安全可靠</p>
        <router-link to="/login" class="btn-enter">进入系统</router-link>
      </div>

      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>© 2025 员工通讯录系统. 保留所有权利。</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
};
</script>

<style scoped>

.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f4f4f4;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}
.navbar {
  background-color: #333;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 0.5px;
  color: white;
}
.content {
  flex: 1;
  padding: 4rem 0;
  text-align: center;
}
.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #222;
}
.btn-enter {
  display: inline-block;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background-color: #444;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s ease;
}
.btn-enter:hover {
  background-color: #666;
}
.footer {
  background-color: #222;
  color: #aaa;
  text-align: center;
  padding: 1rem 0;
  font-size: 0.9rem;
}
</style>