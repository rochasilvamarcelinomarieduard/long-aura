<template>
  <div class="admin-wrap">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="url(#sg)"/>
          <path d="M10 14l-3-3 1.4-1.4L10 11.2l5.6-5.6L17 7l-7 7z" fill="#0a0a0a"/>
          <defs>
            <linearGradient id="sg" x1="3" y1="1" x2="21" y2="23" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff2d55"/><stop offset="1" stop-color="#ff6a00"/>
            </linearGradient>
          </defs>
        </svg>
        <span class="sidebar-brand">LONG AURA</span>
      </div>

      <nav class="sidebar-nav">
        <p class="nav-section-label">Painel</p>
        <button
          v-for="tab in tabs" :key="tab.key"
          class="nav-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="nav-icon" v-html="tab.icon" />
          <span>{{ tab.label }}</span>
          <span v-if="tab.count !== undefined" class="nav-count">{{ tab.count }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar">{{ currentUser?.username?.[0]?.toUpperCase() }}</div>
          <div class="sidebar-user-info">
            <p class="sidebar-user-name">{{ currentUser?.nome || currentUser?.username }}</p>
            <p class="sidebar-user-role">Administrador</p>
          </div>
        </div>
        <button class="logout-btn" @click="logout" title="Sair">
          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div>
          <h1 class="page-title">{{ currentTabLabel }}</h1>
          <p class="page-sub">{{ new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) }}</p>
        </div>
        <div class="topbar-right">
          <!-- Global Search -->
          <div class="global-search-wrap">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" class="global-search-icon">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              v-model="globalSearch"
              class="global-search-input"
              placeholder="Busca global… (usuário, vídeo)"
              @focus="globalSearchFocused = true"
              @blur="setTimeout(() => globalSearchFocused = false, 200)"
            />
            <kbd class="search-kbd">⌘K</kbd>
            <!-- Global search results -->
            <div v-if="globalSearchFocused && globalSearch.length > 1 && globalResults.length > 0" class="global-results">
              <div v-for="r in globalResults" :key="r._type + r.id" class="global-result-item" @mousedown="handleGlobalResult(r)">
                <span class="global-result-type">{{ r._type === 'user' ? '👤' : '🎬' }}</span>
                <div>
                  <p class="global-result-name">{{ r._type === 'user' ? (r.nome || r.username) : r.titulo }}</p>
                  <p class="global-result-sub">{{ r._type === 'user' ? `@${r.username}` : `@${r.profiles?.username}` }}</p>
                </div>
              </div>
            </div>
            <div v-else-if="globalSearchFocused && globalSearch.length > 1 && globalResults.length === 0" class="global-results">
              <div class="global-result-empty">Nenhum resultado para "{{ globalSearch }}"</div>
            </div>
          </div>

          <div class="live-dot" />
          <span class="live-text">Ao vivo</span>
          <button class="refresh-btn" @click="refreshAll" :class="{ spinning: refreshing }" title="Atualizar">
            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Stats (sempre visíveis) -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label" :style="{ '--accent': stat.accent }">
          <div class="stat-top">
            <div class="stat-icon-wrap">
              <span v-html="stat.icon" />
            </div>
            <span class="stat-delta" :class="stat.deltaType">{{ stat.delta }}</span>
          </div>
          <p class="stat-value">{{ stat.loading ? '—' : stat.value?.toLocaleString('pt-BR') }}</p>
          <p class="stat-label">{{ stat.label }}</p>
          <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: stat.loading ? '0%' : stat.pct }" /></div>
        </div>
      </div>

      <!-- ── Tab: Analytics ── -->
      <div v-if="activeTab === 'analytics'" class="panel">
        <div class="panel-header">
          <span class="panel-count">Visão geral da plataforma</span>
          <div class="topbar-right" style="gap:8px">
            <select v-model="analyticsRange" class="filter-select">
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>

        <!-- Métricas rápidas -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.04)">
          <div class="analytics-metric">
            <p class="analytics-metric-val" style="color:#6366f1">{{ users.filter(u => u.banido).length }}</p>
            <p class="analytics-metric-label">Usuários banidos</p>
          </div>
          <div class="analytics-metric">
            <p class="analytics-metric-val" style="color:#ff2d55">{{ users.filter(u => u.is_admin).length }}</p>
            <p class="analytics-metric-label">Administradores</p>
          </div>
          <div class="analytics-metric">
            <p class="analytics-metric-val" style="color:#10b981">
              {{ pedidos.filter(p => p.status === 'entregue').length }}
            </p>
            <p class="analytics-metric-label">Pedidos entregues</p>
          </div>
          <div class="analytics-metric">
            <p class="analytics-metric-val" style="color:#fb923c">
              {{ pedidos.filter(p => p.status === 'em_rota').length }}
            </p>
            <p class="analytics-metric-label">Em rota agora</p>
          </div>
          <div class="analytics-metric">
            <p class="analytics-metric-val" style="color:#fbbf24">
              {{ vipMembros.length }}
            </p>
            <p class="analytics-metric-label">Membros VIP</p>
          </div>
          <div class="analytics-metric">
            <p class="analytics-metric-val" style="color:#34d399">
              {{ totalPontosVip.toLocaleString('pt-BR') }}
            </p>
            <p class="analytics-metric-label">Pontos VIP em circulação</p>
          </div>
        </div>

        <!-- Distribuição de pedidos por status -->
        <div style="padding:24px 20px;border-bottom:1px solid rgba(255,255,255,.04)">
          <p class="analytics-section-title">Pedidos por status</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">
            <div v-for="s in statusOpcoes" :key="s.value" class="analytics-bar-row">
              <span class="analytics-bar-label">{{ s.label }}</span>
              <div class="analytics-bar-track">
                <div
                  class="analytics-bar-fill"
                  :style="{
                    width: pedidos.length ? `${(pedidos.filter(p => p.status === s.value).length / pedidos.length * 100).toFixed(1)}%` : '0%',
                    background: s.color
                  }"
                />
              </div>
              <span class="analytics-bar-count" :style="{ color: s.color }">
                {{ pedidos.filter(p => p.status === s.value).length }}
              </span>
            </div>
          </div>
        </div>

        <!-- Top produtos por estoque baixo -->
        <div style="padding:24px 20px;border-bottom:1px solid rgba(255,255,255,.04)">
          <p class="analytics-section-title">⚠️ Produtos com estoque baixo (≤ 5)</p>
          <div v-if="produtosEstoqueBaixo.length === 0" class="drawer-empty" style="padding:16px 0">
            Todos os produtos têm estoque adequado.
          </div>
          <table v-else class="data-table" style="margin-top:12px">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Preço</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in produtosEstoqueBaixo" :key="p.id">
                <td>
                  <div class="user-cell">
                    <img v-if="p.img" :src="p.img" class="prod-thumb" />
                    <div v-else class="prod-thumb-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="opacity:.3"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                    </div>
                    <p class="user-name">{{ p.nome }}</p>
                  </div>
                </td>
                <td>
                  <span :style="{ color: (p.qtd_estoque ?? p.estoque ?? 0) === 0 ? '#ff2d55' : '#fb923c', fontWeight: 700 }">
                    {{ p.qtd_estoque ?? p.estoque ?? 0 }}
                  </span>
                </td>
                <td style="color:#10b981;font-weight:700">R$ {{ Number(p.preco).toFixed(2) }}</td>
                <td>
                  <button class="action-btn btn-edit" @click="abrirEditarProduto(p); activeTab = 'products'">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Receita total dos pedidos -->
        <div style="padding:24px 20px">
          <p class="analytics-section-title">💰 Receita por status de pedido</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">
            <div v-for="s in statusOpcoes" :key="s.value" class="analytics-bar-row">
              <span class="analytics-bar-label">{{ s.label }}</span>
              <span style="font-size:13px;font-weight:700;font-family:'JetBrains Mono',monospace" :style="{color: s.color}">
                {{ receitaPorStatus(s.value) }}
              </span>
            </div>
          </div>
          <div style="margin-top:16px;padding:12px 16px;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15);border-radius:10px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:13px;color:rgba(240,235,255,.5)">Receita total (todos os pedidos)</span>
            <span style="font-size:18px;font-weight:700;color:#10b981;font-family:'JetBrains Mono',monospace">
              {{ receitaTotal }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tab: Usuários -->
      <div v-if="activeTab === 'users'" class="panel">
        <div class="panel-header">
          <div class="panel-header-left">
            <!-- Batch actions -->
            <div v-if="selectedUsers.length > 0" class="batch-bar">
              <span class="batch-count">{{ selectedUsers.length }} selecionado(s)</span>
              <button class="action-btn btn-remove-admin" @click="batchBan(true)">Banir todos</button>
              <button class="action-btn btn-edit" @click="batchBan(false)">Desbanir todos</button>
              <button class="action-btn btn-delete" @click="batchDelete">Excluir todos</button>
              <button class="action-btn" style="background:rgba(255,255,255,.05);color:rgba(240,235,255,.4);border-color:rgba(255,255,255,.08)" @click="selectedUsers = []">Cancelar</button>
            </div>
            <span v-else class="panel-count">
              {{ paginatedUsers.total }}
              <span v-if="userSearch" class="panel-count-sub"> de {{ users.length }}</span>
              usuários
              <span v-if="users.filter(u=>u.banido).length > 0" style="margin-left:8px;background:rgba(255,45,85,.1);color:#ff2d55;border:1px solid rgba(255,45,85,.2);font-size:10px;padding:2px 7px;border-radius:5px;font-family:'JetBrains Mono',monospace">
                {{ users.filter(u=>u.banido).length }} banidos
              </span>
            </span>
          </div>
          <div class="panel-header-right">
            <!-- Filtro de status -->
            <select v-model="userStatusFilter" class="filter-select">
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="banned">Banidos</option>
              <option value="admin">Admins</option>
            </select>
            <div class="sort-wrap">
              <button class="sort-btn" :class="{ active: userSort === 'seguidores' }" @click="toggleUserSort('seguidores')">
                Seguidores {{ userSort === 'seguidores' ? (userSortDir === 'desc' ? '↓' : '↑') : '' }}
              </button>
              <button class="sort-btn" :class="{ active: userSort === 'videos' }" @click="toggleUserSort('videos')">
                Vídeos {{ userSort === 'videos' ? (userSortDir === 'desc' ? '↓' : '↑') : '' }}
              </button>
              <button class="sort-btn" :class="{ active: userSort === 'created_at' }" @click="toggleUserSort('created_at')">
                Data {{ userSort === 'created_at' ? (userSortDir === 'desc' ? '↓' : '↑') : '' }}
              </button>
            </div>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" class="search-icon">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input v-model="userSearch" class="search-input" placeholder="Buscar…" />
            </div>
            <button class="export-btn" @click="exportCSV('users')" title="Exportar CSV">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              CSV
            </button>
          </div>
        </div>

        <div v-if="loadingUsers" class="loading-state">
          <div class="skeleton-row" v-for="i in 5" :key="i" />
        </div>

        <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:36px">
                <input type="checkbox" class="row-checkbox" :checked="allUsersSelected" @change="toggleSelectAllUsers" />
              </th>
              <th>Usuário</th>
              <th>Email</th>
              <th>Criado em</th>
              <th>Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in paginatedUsers.items" :key="u.id" class="clickable-row" :class="{ 'row-selected': selectedUsers.includes(u.id) }" @click.stop="openDrawer(u)">
              <td @click.stop>
                <input type="checkbox" class="row-checkbox" :checked="selectedUsers.includes(u.id)" @change="toggleSelectUser(u.id)" />
              </td>
              <td>
                <div class="user-cell">
                  <img v-if="u.avatar_url" :src="u.avatar_url" class="user-avatar" />
                  <div v-else class="user-avatar-placeholder">{{ u.username?.[0]?.toUpperCase() }}</div>
                  <div>
                    <p class="user-name">{{ u.nome }}</p>
                    <p class="user-handle">@{{ u.username }} · {{ (u.seguidores ?? 0).toLocaleString('pt-BR') }} seg. · {{ userVideoCounts[u.id] ?? 0 }} vídeos</p>
                  </div>
                </div>
              </td>
              <td class="muted">{{ u.email }}</td>
              <td class="muted">{{ formatDate(u.created_at) }}</td>
              <td>
                <div style="display:flex;gap:5px;flex-wrap:wrap">
                  <span class="badge" :class="u.is_admin ? 'badge-admin' : 'badge-user'">
                    {{ u.is_admin ? 'Admin' : 'Usuário' }}
                  </span>
                  <span v-if="u.banido" class="badge" style="background:rgba(255,45,85,.12);color:#ff2d55;border:1px solid rgba(255,45,85,.3)">
                    Banido
                  </span>
                </div>
              </td>
              <td class="actions-col">
                <div class="action-btns" @click.stop>
                  <button
                    class="action-btn icon-btn"
                    :class="u.banido ? 'btn-edit' : 'btn-remove-admin'"
                    @click="confirmToggleBan(u)"
                    :disabled="u.id === authState.user?.id"
                    :title="u.banido ? 'Desbanir' : 'Banir'"
                  >{{ u.banido ? 'Desbanir' : 'Banir' }}</button>
                  <button
                    class="action-btn icon-btn"
                    :class="u.is_admin ? 'btn-remove-admin' : 'btn-make-admin'"
                    @click="toggleAdmin(u)"
                    :disabled="u.id === authState.user?.id"
                    :title="u.is_admin ? 'Remover admin' : 'Tornar admin'"
                  >{{ u.is_admin ? '✕ Admin' : '+ Admin' }}</button>
                  <button
                    class="action-btn icon-btn btn-delete"
                    @click="confirmDeleteUser(u)"
                    :disabled="u.id === authState.user?.id"
                    title="Excluir conta"
                  >Excluir</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Paginação usuários -->
        <div v-if="paginatedUsers.totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="userPage === 1" @click="userPage--">←</button>
          <span class="page-info">{{ userPage }} / {{ paginatedUsers.totalPages }}</span>
          <button class="page-btn" :disabled="userPage >= paginatedUsers.totalPages" @click="userPage++">→</button>
        </div>
      </div>

      <!-- Tab: Vídeos -->
      <div v-if="activeTab === 'videos'" class="panel">
        <div class="panel-header">
          <span class="panel-count">
            {{ paginatedVideos.total }}
            <span v-if="videoSearch" class="panel-count-sub"> de {{ videos.length }}</span>
            vídeos
          </span>
          <div class="panel-header-right">
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" class="search-icon">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input v-model="videoSearch" class="search-input" placeholder="Buscar…" />
            </div>
            <button class="export-btn" @click="exportCSV('videos')" title="Exportar CSV">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              CSV
            </button>
          </div>
        </div>
        <div v-if="loadingVideos" class="loading-state">
          <div class="skeleton-row" v-for="i in 5" :key="i" />
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Vídeo</th>
              <th>Autor</th>
              <th>Engajamento</th>
              <th>Publicado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in paginatedVideos.items" :key="v.id" class="clickable-row" @click.stop="openVideoDrawer(v)">
              <td>
                <div class="video-cell">
                  <div class="video-thumb-wrap">
                    <img v-if="v.thumbnail_url" :src="v.thumbnail_url" class="video-thumb" />
                    <div v-else class="video-thumb-placeholder">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="opacity:.3"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    </div>
                  </div>
                  <div>
                    <p class="video-title">{{ v.titulo || 'Sem título' }}</p>
                    <p class="video-desc muted">{{ v.descricao?.slice(0, 50) }}</p>
                  </div>
                </div>
              </td>
              <td><span class="user-handle">@{{ v.profiles?.username }}</span></td>
              <td>
                <div class="engagement-row">
                  <span class="eng-stat eng-likes">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    {{ (v.likes ?? 0).toLocaleString('pt-BR') }}
                  </span>
                  <span class="eng-stat eng-comments">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    {{ (v.comentarios ?? 0).toLocaleString('pt-BR') }}
                  </span>
                  <span class="eng-stat eng-reposts">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                    {{ (v.reposts ?? 0).toLocaleString('pt-BR') }}
                  </span>
                </div>
              </td>
              <td class="muted">{{ formatDate(v.created_at) }}</td>
              <td @click.stop>
                <button class="action-btn btn-delete" @click="confirmDeleteVideo(v)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="paginatedVideos.totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="videoPage === 1" @click="videoPage--">←</button>
          <span class="page-info">{{ videoPage }} / {{ paginatedVideos.totalPages }}</span>
          <button class="page-btn" :disabled="videoPage >= paginatedVideos.totalPages" @click="videoPage++">→</button>
        </div>
      </div>

      <!-- Tab: Comentários -->
      <div v-if="activeTab === 'comments'" class="panel">
        <div class="panel-header">
          <span class="panel-count">{{ comments.length }} comentários</span>
          <button class="export-btn" @click="exportCSV('comments')" title="Exportar CSV">
            <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            CSV
          </button>
        </div>
        <div v-if="loadingComments" class="loading-state">
          <div class="skeleton-row" v-for="i in 5" :key="i" />
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Texto</th>
              <th>Vídeo</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in paginatedComments.items" :key="c.id" class="clickable-row" @click.stop="openCommentDrawer(c)">
              <td><span class="user-handle">@{{ c.profiles?.username }}</span></td>
              <td><span class="comment-text-cell">{{ c.texto }}</span></td>
              <td class="muted video-title">{{ c.videos?.titulo || 'Sem título' }}</td>
              <td class="muted">{{ formatDate(c.created_at) }}</td>
              <td @click.stop>
                <button class="action-btn btn-delete" @click="confirmDeleteComment(c)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="paginatedComments.totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="commentPage === 1" @click="commentPage--">←</button>
          <span class="page-info">{{ commentPage }} / {{ paginatedComments.totalPages }}</span>
          <button class="page-btn" :disabled="commentPage >= paginatedComments.totalPages" @click="commentPage++">→</button>
        </div>
      </div>

      <!-- Tab: Produtos -->
      <div v-if="activeTab === 'products'" class="panel">
        <div class="panel-header">
          <span class="panel-count">
            {{ filteredProdutos.length }}
            <span v-if="produtoSearch" class="panel-count-sub"> de {{ produtos.length }}</span>
            produtos
          </span>
          <div class="panel-header-right">
            <select v-model="produtoFiltroFlag" class="filter-select">
              <option value="all">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="promo">Em promoção</option>
              <option value="destaque">Destaque</option>
              <option value="mais_vendido">Mais vendidos</option>
              <option value="sem_estoque">Sem estoque</option>
            </select>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" class="search-icon">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input v-model="produtoSearch" class="search-input" placeholder="Buscar produto…" />
            </div>
            <button class="export-btn" @click="exportCSV('products')">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              CSV
            </button>
            <button class="action-btn btn-edit" style="padding:7px 14px;display:flex;align-items:center;gap:6px;white-space:nowrap" @click="abrirNovoProduto">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Novo produto
            </button>
          </div>
        </div>
        <div v-if="loadingProdutos" class="loading-state">
          <div class="skeleton-row" v-for="i in 5" :key="i" />
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Flags</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredProdutos" :key="p.id">
              <td>
                <div class="user-cell">
                  <img v-if="p.img" :src="p.img" class="prod-thumb" />
                  <div v-else class="prod-thumb-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="opacity:.3"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                  <div>
                    <p class="user-name">{{ p.nome }}</p>
                    <p class="user-handle">{{ p.descricao?.slice(0, 40) }}</p>
                  </div>
                </div>
              </td>
              <td class="muted">{{ p.categoria || '—' }}</td>
              <td>
                <span style="color:#10b981;font-weight:700">R$ {{ Number(p.preco).toFixed(2) }}</span>
                <span v-if="p.original" class="muted" style="text-decoration:line-through;font-size:11px;margin-left:6px">R$ {{ Number(p.original).toFixed(2) }}</span>
              </td>
              <td>
                <span :style="{ color: (p.qtd_estoque ?? p.estoque ?? 0) > 0 ? 'rgba(240,235,255,.6)' : '#ff2d55' }">
                  {{ p.qtd_estoque ?? p.estoque ?? 0 }}
                </span>
              </td>
              <td>
                <div style="display:flex;gap:5px;flex-wrap:wrap">
                  <span class="flag-badge" :class="p.ativo ? 'flag-on' : 'flag-off'" @click="toggleProdutoFlag(p, 'ativo')" title="Ativo">Ativo</span>
                  <span class="flag-badge" :class="p.promo ? 'flag-on' : 'flag-off'" @click="toggleProdutoFlag(p, 'promo')" title="Promoção">Promo</span>
                  <span class="flag-badge" :class="p.destaque ? 'flag-on' : 'flag-off'" @click="toggleProdutoFlag(p, 'destaque')" title="Destaque">Dest.</span>
                  <span class="flag-badge" :class="p.mais_vendido ? 'flag-on' : 'flag-off'" @click="toggleProdutoFlag(p, 'mais_vendido')" title="Mais Vendido">Top</span>
                </div>
              </td>
              <td>
                <div class="action-btns">
                  <button class="action-btn btn-edit" @click="abrirEditarProduto(p)">Editar</button>
                  <button class="action-btn btn-delete" @click="confirmDeleteProduto(p)">Excluir</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab: Pedidos -->
      <div v-if="activeTab === 'pedidos'" class="panel">
        <div class="panel-header">
          <span class="panel-count">
            {{ filteredPedidos.length }}
            <span v-if="pedidoSearch || pedidoStatusFilter !== 'all'" class="panel-count-sub"> de {{ pedidos.length }}</span>
            pedidos
          </span>
          <div class="panel-header-right">
            <select v-model="pedidoStatusFilter" class="filter-select">
              <option value="all">Todos os status</option>
              <option v-for="s in statusOpcoes" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" class="search-icon">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input v-model="pedidoSearch" class="search-input" placeholder="Buscar pedido…" />
            </div>
            <button class="export-btn" @click="exportCSV('pedidos')">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              CSV
            </button>
          </div>
        </div>

        <div v-if="loadingPedidos" class="loading-state">
          <div class="skeleton-row" v-for="i in 5" :key="i" />
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Status</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Endereço</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredPedidos" :key="p.id" class="clickable-row" @click="abrirPedidoDrawer(p)">
              <td>
                <div>
                  <p class="user-name">#{{ p.numero }}</p>
                  <p class="user-handle">{{ p.itens_pedido?.length || 0 }} iten(s)</p>
                </div>
              </td>
              <td>
                <span class="badge" :style="{
                  background: statusOpcoes.find(s => s.value === p.status)?.color + '18',
                  color: statusOpcoes.find(s => s.value === p.status)?.color,
                  borderColor: statusOpcoes.find(s => s.value === p.status)?.color + '40',
                }">
                  {{ statusOpcoes.find(s => s.value === p.status)?.label || p.status }}
                </span>
              </td>
              <td>
                <span class="badge" :class="p.tipo_entrega === 'correios' ? 'badge-user' : 'badge-admin'">
                  {{ p.tipo_entrega === 'correios' ? '📦 Correios' : '🛵 Próprio' }}
                </span>
              </td>
              <td style="color:#10b981;font-weight:700">
                {{ Number(p.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </td>
              <td class="muted" style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ p.endereco_entrega || '—' }}
              </td>
              <td class="muted">{{ formatDate(p.criado_em) }}</td>
              <td @click.stop>
                <button class="action-btn btn-edit" @click="abrirPedidoDrawer(p)">Gerenciar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab: Lista VIP -->
      <div v-if="activeTab === 'vip'" class="panel">
        <div class="panel-header">
          <div class="panel-header-left">
            <span class="panel-count">
              {{ filteredVip.length }}
              <span v-if="vipSearch" class="panel-count-sub"> de {{ vipMembros.length }}</span>
              membros VIP
            </span>
          </div>
          <div class="panel-header-right">
            <div class="sort-wrap">
              <button class="sort-btn" :class="{ active: vipSort === 'pontos' }" @click="toggleVipSort('pontos')">
                Pontos {{ vipSort === 'pontos' ? (vipSortDir === 'desc' ? '↓' : '↑') : '' }}
              </button>
              <button class="sort-btn" :class="{ active: vipSort === 'total_gasto' }" @click="toggleVipSort('total_gasto')">
                Total gasto {{ vipSort === 'total_gasto' ? (vipSortDir === 'desc' ? '↓' : '↑') : '' }}
              </button>
              <button class="sort-btn" :class="{ active: vipSort === 'created_at' }" @click="toggleVipSort('created_at')">
                Entrou em {{ vipSort === 'created_at' ? (vipSortDir === 'desc' ? '↓' : '↑') : '' }}
              </button>
            </div>
            <div class="search-wrap">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" class="search-icon">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input v-model="vipSearch" class="search-input" placeholder="Buscar por email…" />
            </div>
            <button class="export-btn" @click="exportCSV('vip')">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              CSV
            </button>
          </div>
        </div>

        <div v-if="loadingVip" class="loading-state">
          <div class="skeleton-row" v-for="i in 5" :key="i" />
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Pontos</th>
              <th>Total gasto</th>
              <th>Entrou em</th>
              <th>Atualizado em</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filteredVip" :key="m.id" class="clickable-row" @click="openVipDrawer(m)">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-placeholder" style="background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.25);color:#fbbf24">
                    {{ m.email?.[0]?.toUpperCase() }}
                  </div>
                  <p class="user-name">{{ m.email }}</p>
                </div>
              </td>
              <td>
                <span class="badge" style="background:rgba(251,191,36,.1);color:#fbbf24;border:1px solid rgba(251,191,36,.25)">
                  {{ (m.pontos ?? 0).toLocaleString('pt-BR') }} pts
                </span>
              </td>
              <td style="color:#10b981;font-weight:700">
                {{ Number(m.total_gasto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
              </td>
              <td class="muted">{{ formatDate(m.created_at) }}</td>
              <td class="muted">{{ formatDate(m.atualizado_em) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="!loadingVip && filteredVip.length === 0" class="drawer-empty">
          {{ vipSearch ? 'Nenhum membro encontrado para essa busca.' : 'Ainda não há membros na Lista VIP.' }}
        </div>
      </div>

    </main>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmModal.show" class="modal-backdrop" @click.self="confirmModal.show = false">
          <div class="modal">
            <div class="modal-icon" :class="confirmModal.danger ? 'icon-danger' : 'icon-warn'">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3 class="modal-title">{{ confirmModal.title }}</h3>
            <p class="modal-desc">{{ confirmModal.desc }}</p>
            <div class="modal-actions">
              <button class="modal-btn btn-cancel" @click="confirmModal.show = false">Cancelar</button>
              <button class="modal-btn btn-confirm" @click="confirmModal.action">Confirmar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          {{ toast.msg }}
        </div>
      </Transition>
    </Teleport>

    <!-- Video Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="videoDrawer.show" class="drawer-backdrop" @click.self="videoDrawer.show = false">
          <div class="drawer">
            <div class="drawer-header">
              <button class="drawer-close" @click="videoDrawer.show = false">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
                Voltar
              </button>
              <div class="drawer-actions-top">
                <button class="action-btn btn-delete" @click="confirmDeleteVideo(videoDrawer.video); videoDrawer.show = false">Excluir vídeo</button>
              </div>
            </div>

            <div class="drawer-body">
              <div class="vd-card">
                <div class="vd-preview">
           <video
  v-if="videoDrawer.video?.video_url"
  :src="videoDrawer.video.video_url"
  :poster="videoDrawer.video.thumbnail_url || undefined"
  class="vd-video"
  controls
  preload="metadata"
  :muted="!!videoDrawer.video?.som_url"
  @play="adminAudioEl?.play().catch(()=>{})"
  @pause="adminAudioEl?.pause()"
/>

<!-- Áudio da música postada no foryou -->
<audio
  v-if="videoDrawer.video?.som_url"
  ref="adminAudioEl"
  :src="videoDrawer.video.som_url"
  loop
  preload="none"
/>
                  <div v-else-if="videoDrawer.video?.thumbnail_url" class="vd-thumb-wrap">
                    <img :src="videoDrawer.video.thumbnail_url" class="vd-thumb" />
                    <span class="vd-thumb-label">Sem vídeo · apenas thumbnail</span>
                  </div>
                  <div v-else class="vd-no-preview">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32" style="opacity:.3">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <span>Sem preview disponível</span>
                  </div>
                </div>

                <div class="vd-info">
                  <h2 class="vd-title">{{ videoDrawer.video?.titulo || 'Sem título' }}</h2>
                  <p v-if="videoDrawer.video?.descricao" class="vd-desc">{{ videoDrawer.video.descricao }}</p>
                  <div class="vd-author">
                    <div class="user-avatar-placeholder" style="width:26px;height:26px;font-size:10px">
                      {{ videoDrawer.video?.profiles?.username?.[0]?.toUpperCase() }}
                    </div>
                    <span class="user-handle">@{{ videoDrawer.video?.profiles?.username }}</span>
                    <span class="muted" style="font-size:11px">· {{ formatDate(videoDrawer.video?.created_at) }}</span>
                  </div>
                  <div class="vd-stats">
                    <div class="vd-stat">
                      <svg viewBox="0 0 24 24" fill="#ff2d55" width="14" height="14"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      <span>{{ (videoDrawer.video?.likes ?? 0).toLocaleString('pt-BR') }}</span>
                      <p class="vd-stat-label">Likes</p>
                    </div>
                    <div class="vd-stat">
                      <svg viewBox="0 0 24 24" fill="#6366f1" width="14" height="14"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                      <span>{{ (videoDrawer.video?.comentarios ?? 0).toLocaleString('pt-BR') }}</span>
                      <p class="vd-stat-label">Comentários</p>
                    </div>
                    <div class="vd-stat">
                      <svg viewBox="0 0 24 24" fill="#10b981" width="14" height="14"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                      <span>{{ (videoDrawer.video?.reposts ?? 0).toLocaleString('pt-BR') }}</span>
                      <p class="vd-stat-label">Reposts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="drawer-tabs" style="flex-shrink:0">
                <button class="drawer-tab" :class="{ active: videoDrawer.tab === 'comments' }" @click="videoDrawer.tab = 'comments'">
                  Comentários ({{ videoDrawer.comments.length }})
                </button>
                <button class="drawer-tab" :class="{ active: videoDrawer.tab === 'likes' }" @click="videoDrawer.tab = 'likes'">
                  Curtidas ({{ videoDrawer.likes.length }})
                </button>
                <button class="drawer-tab" :class="{ active: videoDrawer.tab === 'reposts' }" @click="videoDrawer.tab = 'reposts'">
                  Reposts ({{ videoDrawer.reposts.length }})
                </button>
              </div>

              <div v-if="videoDrawer.tab === 'comments'" class="drawer-content">
                <div v-if="videoDrawer.loadingComments" class="loading-state">
                  <div class="skeleton-row" v-for="i in 3" :key="i" />
                </div>
                <div v-else-if="videoDrawer.comments.length === 0" class="drawer-empty">Nenhum comentário neste vídeo.</div>
                <div v-else class="drawer-comment-list">
                  <div v-for="c in videoDrawer.comments" :key="c.id" class="drawer-comment-item">
                    <div class="drawer-comment-info">
                      <p class="user-handle" style="margin-bottom:4px">@{{ c.profiles?.username }}</p>
                      <p class="drawer-comment-text">{{ c.texto }}</p>
                      <p class="drawer-comment-video muted">{{ formatDate(c.created_at) }}</p>
                    </div>
                    <button class="action-btn btn-delete drawer-item-del" @click="confirmDeleteComment(c)">Excluir</button>
                  </div>
                </div>
              </div>

              <div v-if="videoDrawer.tab === 'likes'" class="drawer-content">
                <div v-if="videoDrawer.loadingLikes" class="loading-state">
                  <div class="skeleton-row" v-for="i in 3" :key="i" />
                </div>
                <div v-else-if="videoDrawer.likes.length === 0" class="drawer-empty">Nenhuma curtida neste vídeo.</div>
                <div v-else class="drawer-comment-list">
                  <div v-for="l in videoDrawer.likes" :key="l.id" class="drawer-comment-item">
                    <div class="drawer-comment-info">
                      <p class="user-handle">@{{ l.profiles?.username }}</p>
                      <p class="drawer-comment-video muted">{{ formatDate(l.created_at) }}</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="#ff2d55" width="16" height="16" style="flex-shrink:0;align-self:center"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  </div>
                </div>
              </div>

              <div v-if="videoDrawer.tab === 'reposts'" class="drawer-content">
                <div v-if="videoDrawer.loadingReposts" class="loading-state">
                  <div class="skeleton-row" v-for="i in 3" :key="i" />
                </div>
                <div v-else-if="videoDrawer.reposts.length === 0" class="drawer-empty">Nenhum repost neste vídeo.</div>
                <div v-else class="drawer-comment-list">
                  <div v-for="r in videoDrawer.reposts" :key="r.id" class="drawer-comment-item">
                    <div class="drawer-comment-info">
                      <p class="user-handle">@{{ r.profiles?.username }}</p>
                      <p class="drawer-comment-video muted">{{ formatDate(r.created_at) }}</p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="#10b981" width="16" height="16" style="flex-shrink:0;align-self:center"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Comment Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="commentDrawer.show" class="drawer-backdrop" @click.self="commentDrawer.show = false">
          <div class="drawer">
            <div class="drawer-header">
              <button class="drawer-close" @click="commentDrawer.show = false">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
                Voltar
              </button>
              <div class="drawer-actions-top">
                <button class="action-btn btn-delete" @click="confirmDeleteComment(commentDrawer.comment); commentDrawer.show = false">Excluir comentário</button>
              </div>
            </div>

            <div class="drawer-body">
              <div class="cd-card">
                <div class="cd-bubble">
                  <p class="cd-text">{{ commentDrawer.comment?.texto }}</p>
                </div>
                <div class="cd-meta">
                  <div class="cd-author">
                    <div class="user-avatar-placeholder" style="width:30px;height:30px;font-size:11px">
                      {{ commentDrawer.comment?.profiles?.username?.[0]?.toUpperCase() }}
                    </div>
                    <div>
                      <p class="user-handle">@{{ commentDrawer.comment?.profiles?.username }}</p>
                      <p class="muted" style="font-size:11px">{{ formatDate(commentDrawer.comment?.created_at) }}</p>
                    </div>
                  </div>
                  <div class="cd-video-ref">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style="color:#ff2d55;flex-shrink:0">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <div>
                      <p style="font-size:10px;color:rgba(240,235,255,.3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px">No vídeo</p>
                      <p class="video-title">{{ commentDrawer.comment?.videos?.titulo || 'Sem título' }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="commentDrawer.related.length > 0" class="cd-related">
                  <p class="cd-related-label">Outros comentários deste usuário</p>
                  <div v-for="r in commentDrawer.related" :key="r.id" class="drawer-comment-item">
                    <div class="drawer-comment-info">
                      <p class="drawer-comment-text">{{ r.texto }}</p>
                      <p class="drawer-comment-video muted">{{ formatDate(r.created_at) }}</p>
                    </div>
                    <button class="action-btn btn-delete drawer-item-del" @click="confirmDeleteComment(r)">Excluir</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- User Drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="drawer.show" class="drawer-backdrop" @click.self="drawer.show = false">
          <div class="drawer">
            <div class="drawer-header">
              <button class="drawer-close" @click="drawer.show = false">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
                Voltar
              </button>
              <div class="drawer-actions-top">
                <button
                  class="action-btn"
                  :class="drawer.user?.banido ? 'btn-edit' : 'btn-remove-admin'"
                  @click="confirmToggleBan(drawer.user)"
                  :disabled="drawer.user?.id === authState.user?.id"
                >{{ drawer.user?.banido ? 'Desbanir' : 'Banir usuário' }}</button>
                <button
                  class="action-btn"
                  :class="drawer.user?.is_admin ? 'btn-remove-admin' : 'btn-make-admin'"
                  @click="toggleAdminDrawer"
                  :disabled="drawer.user?.id === authState.user?.id"
                >{{ drawer.user?.is_admin ? 'Remover admin' : 'Tornar admin' }}</button>
                <button
                  class="action-btn btn-delete"
                  @click="confirmDeleteUser(drawer.user)"
                  :disabled="drawer.user?.id === authState.user?.id"
                >Excluir conta</button>
              </div>
            </div>

            <div class="drawer-body">
              <div class="drawer-hero">
                <div class="drawer-avatar-wrap">
                  <img v-if="drawer.user?.avatar_url" :src="drawer.user.avatar_url" class="drawer-avatar" />
                  <div v-else class="drawer-avatar-placeholder">{{ drawer.user?.username?.[0]?.toUpperCase() }}</div>
                  <span class="drawer-role-badge" :class="drawer.user?.is_admin ? 'badge-admin' : 'badge-user'">
                    {{ drawer.user?.is_admin ? 'Admin' : 'Usuário' }}
                  </span>
                </div>
                <div class="drawer-hero-info">
                  <h2 class="drawer-name">{{ drawer.user?.nome || drawer.user?.username }}</h2>
                  <p class="drawer-handle">@{{ drawer.user?.username }}</p>
                  <p class="drawer-email">{{ drawer.user?.email }}</p>
                  <p v-if="drawer.user?.banido" style="margin-top:6px">
                    <span class="badge" style="background:rgba(255,45,85,.12);color:#ff2d55;border:1px solid rgba(255,45,85,.3)">
                      Usuário banido {{ drawer.user?.banido_em ? '· ' + formatDate(drawer.user.banido_em) : '' }}
                    </span>
                  </p>
                  <p v-if="drawer.user?.bio" class="drawer-bio">{{ drawer.user.bio }}</p>
                </div>
              </div>

              <div class="drawer-stats">
                <div class="drawer-stat">
                  <p class="drawer-stat-val">{{ (drawer.user?.seguidores ?? 0).toLocaleString('pt-BR') }}</p>
                  <p class="drawer-stat-label">Seguidores</p>
                </div>
                <div class="drawer-stat">
                  <p class="drawer-stat-val">{{ (drawer.user?.seguindo ?? 0).toLocaleString('pt-BR') }}</p>
                  <p class="drawer-stat-label">Seguindo</p>
                </div>
                <div class="drawer-stat">
                  <p class="drawer-stat-val">{{ drawer.videos.length }}</p>
                  <p class="drawer-stat-label">Vídeos</p>
                </div>
                <div class="drawer-stat">
                  <p class="drawer-stat-val">{{ drawer.comments.length }}</p>
                  <p class="drawer-stat-label">Comentários</p>
                </div>
                <div class="drawer-stat">
                  <p class="drawer-stat-val">{{ formatDate(drawer.user?.created_at) }}</p>
                  <p class="drawer-stat-label">Membro desde</p>
                </div>
              </div>

              <div class="drawer-tabs">
                <button
                  v-for="t in ['videos','comments']" :key="t"
                  class="drawer-tab"
                  :class="{ active: drawer.tab === t }"
                  @click="drawer.tab = t"
                >
                  {{ t === 'videos' ? `Vídeos (${drawer.videos.length})` : `Comentários (${drawer.comments.length})` }}
                </button>
              </div>

              <div v-if="drawer.tab === 'videos'" class="drawer-content">
                <div v-if="drawer.loadingVideos" class="loading-state">
                  <div class="skeleton-row" v-for="i in 3" :key="i" />
                </div>
                <div v-else-if="drawer.videos.length === 0" class="drawer-empty">Nenhum vídeo postado.</div>
                <div v-else class="drawer-video-list">
                  <div v-for="v in drawer.videos" :key="v.id" class="drawer-video-item drawer-video-item--clickable" @click="openVideoDrawer(v)">
                    <div class="drawer-video-info">
                      <p class="drawer-video-title">{{ v.titulo || 'Sem título' }}</p>
                      <p class="drawer-video-desc muted">{{ v.descricao?.slice(0, 80) }}</p>
                      <div class="drawer-video-meta">
                        <span>❤️ {{ v.likes ?? 0 }}</span>
                        <span>💬 {{ v.comentarios ?? 0 }}</span>
                        <span>🔁 {{ v.reposts ?? 0 }}</span>
                        <span class="muted">{{ formatDate(v.created_at) }}</span>
                      </div>
                    </div>
                    <button class="action-btn btn-delete drawer-item-del" @click.stop="confirmDeleteVideo(v)">Excluir</button>
                  </div>
                </div>
              </div>

              <div v-if="drawer.tab === 'comments'" class="drawer-content">
                <div v-if="drawer.loadingComments" class="loading-state">
                  <div class="skeleton-row" v-for="i in 3" :key="i" />
                </div>
                <div v-else-if="drawer.comments.length === 0" class="drawer-empty">Nenhum comentário feito.</div>
                <div v-else class="drawer-comment-list">
                  <div v-for="c in drawer.comments" :key="c.id" class="drawer-comment-item">
                    <div class="drawer-comment-info">
                      <p class="drawer-comment-text">{{ c.texto }}</p>
                      <p class="drawer-comment-video muted">em "{{ c.videos?.titulo || 'Sem título' }}" · {{ formatDate(c.created_at) }}</p>
                    </div>
                    <button class="action-btn btn-delete drawer-item-del" @click="confirmDeleteComment(c)">Excluir</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>

  <!-- Edit Produto Drawer -->
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="editProdutoDrawer.show" class="drawer-backdrop" @click.self="editProdutoDrawer.show = false">
        <div class="drawer">
          <div class="drawer-header">
            <button class="drawer-close" @click="editProdutoDrawer.show = false">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
              Voltar
            </button>
            <span class="drawer-edit-title">{{ editProdutoDrawer.modo === 'criar' ? 'Novo produto' : 'Editar produto' }}</span>
          </div>
          <div class="drawer-body">
            <div class="edit-form">
              <div class="edit-field">
                <label class="edit-label">Nome</label>
                <input v-model="editProdutoDrawer.form.nome" class="edit-input" placeholder="Nome do produto" />
              </div>
              <div class="edit-field">
                <label class="edit-label">Categoria</label>
                <input v-model="editProdutoDrawer.form.categoria" class="edit-input" placeholder="skincare, cabelo…" />
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div class="edit-field">
                  <label class="edit-label">Preço (R$)</label>
                  <input v-model="editProdutoDrawer.form.preco" class="edit-input" type="number" step="0.01" placeholder="0.00" />
                </div>
                <div class="edit-field">
                  <label class="edit-label">Preço original (R$)</label>
                  <input v-model="editProdutoDrawer.form.original" class="edit-input" type="number" step="0.01" placeholder="Opcional" />
                </div>
              </div>
              <div class="edit-field">
                <label class="edit-label">Estoque</label>
                <input v-model="editProdutoDrawer.form.qtd_estoque" class="edit-input" type="number" placeholder="0" />
              </div>
              <div class="edit-field">
                <label class="edit-label">URL da imagem</label>
                <input v-model="editProdutoDrawer.form.img" class="edit-input" placeholder="https://…" />
              </div>
              <div class="edit-field">
                <label class="edit-label">Descrição</label>
                <textarea v-model="editProdutoDrawer.form.descricao" class="edit-textarea" rows="2" placeholder="Descrição curta" />
              </div>
              <div class="edit-field">
                <label class="edit-label">Benefícios</label>
                <textarea v-model="editProdutoDrawer.form.beneficios" class="edit-textarea" rows="2" placeholder="Benefícios separados por vírgula" />
              </div>
              <div class="edit-field">
                <label class="edit-label">Flags</label>
                <div class="edit-toggle-row" style="flex-wrap:wrap">
                  <button class="edit-toggle-btn" :class="{ 'active-admin': editProdutoDrawer.form.ativo }" @click="editProdutoDrawer.form.ativo = !editProdutoDrawer.form.ativo">Ativo</button>
                  <button class="edit-toggle-btn" :class="{ 'active-admin': editProdutoDrawer.form.promo }" @click="editProdutoDrawer.form.promo = !editProdutoDrawer.form.promo">Promoção</button>
                  <button class="edit-toggle-btn" :class="{ 'active-admin': editProdutoDrawer.form.destaque }" @click="editProdutoDrawer.form.destaque = !editProdutoDrawer.form.destaque">Destaque</button>
                  <button class="edit-toggle-btn" :class="{ 'active-admin': editProdutoDrawer.form.mais_vendido }" @click="editProdutoDrawer.form.mais_vendido = !editProdutoDrawer.form.mais_vendido">Mais Vendido</button>
                </div>
              </div>
              <div v-if="editProdutoDrawer.erro" class="edit-error">{{ editProdutoDrawer.erro }}</div>
              <div class="edit-actions">
                <button class="edit-btn edit-btn--cancel" @click="editProdutoDrawer.show = false">Cancelar</button>
                <button class="edit-btn edit-btn--save" @click="salvarEdicaoProduto" :disabled="editProdutoDrawer.salvando">
                  {{ editProdutoDrawer.salvando ? 'Salvando…' : (editProdutoDrawer.modo === 'criar' ? 'Criar produto' : 'Salvar') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Pedido Drawer -->
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="pedidoDrawer.show" class="drawer-backdrop" @click.self="pedidoDrawer.show = false">
        <div class="drawer">
          <div class="drawer-header">
            <button class="drawer-close" @click="pedidoDrawer.show = false">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
              Voltar
            </button>
            <span class="drawer-edit-title">Pedido #{{ pedidoDrawer.pedido?.numero }}</span>
          </div>

          <div class="drawer-body">
            <div class="edit-form">
              <div class="edit-avatar-row" style="flex-direction:column;align-items:flex-start;gap:10px">
                <div style="display:flex;justify-content:space-between;width:100%">
                  <div>
                    <p class="edit-avatar-name">#{{ pedidoDrawer.pedido?.numero }}</p>
                    <p class="edit-avatar-handle">{{ pedidoDrawer.pedido?.pagamento }}</p>
                  </div>
                  <p style="color:#10b981;font-weight:700;font-size:16px">
                    {{ Number(pedidoDrawer.pedido?.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                  </p>
                </div>
                <p class="muted" style="font-size:12px">📍 {{ pedidoDrawer.pedido?.endereco_entrega }}</p>
                <div style="display:flex;flex-direction:column;gap:4px;width:100%">
                  <p class="edit-label">Itens do pedido</p>
                  <div v-for="item in pedidoDrawer.pedido?.itens_pedido" :key="item.id"
                    style="display:flex;justify-content:space-between;font-size:12px;padding:6px 10px;background:rgba(255,255,255,.03);border-radius:7px">
                    <span style="color:rgba(240,235,255,.7)">{{ item.nome }}</span>
                    <span style="color:#10b981;font-weight:600">
                      {{ Number(item.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="edit-field">
                <label class="edit-label">Status do pedido</label>
                <div style="display:flex;flex-wrap:wrap;gap:7px">
                  <button
                    v-for="s in statusOpcoes" :key="s.value"
                    class="edit-toggle-btn"
                    :style="pedidoDrawer.form.status === s.value ? {
                      background: s.color + '18',
                      borderColor: s.color + '50',
                      color: s.color
                    } : {}"
                    @click="pedidoDrawer.form.status = s.value; pedidoDrawer.form.etapa_ativa = etapaDoStatus[s.value] ?? 0"
                  >
                    {{ s.label }}
                  </button>
                </div>
              </div>

              <div class="edit-field">
                <label class="edit-label">Tipo de entrega</label>
                <div class="edit-toggle-row">
                  <button class="edit-toggle-btn"
                    :class="{ 'active-admin': pedidoDrawer.form.tipo_entrega === 'proprio' }"
                    @click="pedidoDrawer.form.tipo_entrega = 'proprio'">
                    🛵 Entregador próprio
                  </button>
                  <button class="edit-toggle-btn"
                    :class="{ 'active-admin': pedidoDrawer.form.tipo_entrega === 'correios' }"
                    @click="pedidoDrawer.form.tipo_entrega = 'correios'">
                    📦 Correios
                  </button>
                </div>
              </div>

              <div v-if="pedidoDrawer.form.tipo_entrega === 'correios'" class="edit-field">
                <label class="edit-label">Código de rastreio dos Correios</label>
                <input
                  v-model="pedidoDrawer.form.codigo_rastreio_correios"
                  class="edit-input"
                  placeholder="Ex: BR123456789BR"
                  style="text-transform:uppercase;font-family:'JetBrains Mono',monospace"
                />
                <p style="font-size:11px;color:rgba(240,235,255,.3);margin-top:2px">
                  O cliente verá esse código para rastrear no site dos Correios
                </p>
              </div>

              <div v-if="pedidoDrawer.form.tipo_entrega === 'proprio'" class="edit-field">
                <label class="edit-label">Localização do entregador</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  <div>
                    <p style="font-size:10px;color:rgba(240,235,255,.3);margin-bottom:5px">Latitude</p>
                    <input v-model="pedidoDrawer.form.lat_entregador" class="edit-input" placeholder="-19.9216" type="number" step="0.0001" />
                  </div>
                  <div>
                    <p style="font-size:10px;color:rgba(240,235,255,.3);margin-bottom:5px">Longitude</p>
                    <input v-model="pedidoDrawer.form.lng_entregador" class="edit-input" placeholder="-43.9400" type="number" step="0.0001" />
                  </div>
                </div>
                <p style="font-size:11px;color:rgba(240,235,255,.3);margin-top:4px">
                  💡 Atualiza o mapa em tempo real para o cliente via Realtime
                </p>
              </div>

              <div v-if="pedidoDrawer.erro" class="edit-error">{{ pedidoDrawer.erro }}</div>

              <div class="edit-actions">
                <button class="edit-btn edit-btn--cancel" @click="pedidoDrawer.show = false">Cancelar</button>
                <button class="edit-btn edit-btn--save" @click="salvarPedido" :disabled="pedidoDrawer.salvando">
                  {{ pedidoDrawer.salvando ? 'Salvando…' : 'Salvar pedido' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- VIP History Drawer -->
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="vipDrawer.show" class="drawer-backdrop" @click.self="vipDrawer.show = false">
        <div class="drawer">
          <div class="drawer-header">
            <button class="drawer-close" @click="vipDrawer.show = false">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>
              Voltar
            </button>
          </div>

          <div class="drawer-body">
            <div class="drawer-hero">
              <div class="drawer-avatar-wrap">
                <div class="drawer-avatar-placeholder" style="background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.25);color:#fbbf24">
                  {{ vipDrawer.membro?.email?.[0]?.toUpperCase() }}
                </div>
                <span class="drawer-role-badge" style="background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.3)">VIP</span>
              </div>
              <div class="drawer-hero-info">
                <h2 class="drawer-name">{{ vipDrawer.membro?.email }}</h2>
                <p class="drawer-handle">Membro desde {{ formatDate(vipDrawer.membro?.created_at) }}</p>
              </div>
            </div>

            <div class="drawer-stats">
              <div class="drawer-stat">
                <p class="drawer-stat-val" style="color:#fbbf24">{{ (vipDrawer.membro?.pontos ?? 0).toLocaleString('pt-BR') }}</p>
                <p class="drawer-stat-label">Pontos atuais</p>
              </div>
              <div class="drawer-stat">
                <p class="drawer-stat-val" style="color:#10b981">{{ Number(vipDrawer.membro?.total_gasto || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</p>
                <p class="drawer-stat-label">Total gasto</p>
              </div>
              <div class="drawer-stat">
                <p class="drawer-stat-val">{{ vipDrawer.historico.length }}</p>
                <p class="drawer-stat-label">Movimentações</p>
              </div>
            </div>

            <div class="drawer-tabs" style="flex-shrink:0">
              <button class="drawer-tab active" style="cursor:default">Histórico de pontos</button>
            </div>

            <div class="drawer-content">
              <div v-if="vipDrawer.loadingHistorico" class="loading-state">
                <div class="skeleton-row" v-for="i in 4" :key="i" />
              </div>
              <div v-else-if="vipDrawer.historico.length === 0" class="drawer-empty">
                Nenhuma movimentação registrada para este membro.
              </div>
              <div v-else class="drawer-comment-list">
                <div v-for="h in vipDrawer.historico" :key="h.id" class="drawer-comment-item">
                  <div class="drawer-comment-info">
                    <p class="drawer-comment-text" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                      <span :style="{ color: h.pontos < 0 ? '#ff2d55' : '#10b981', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }">
                        {{ h.pontos > 0 ? '+' : '' }}{{ h.pontos }} pts
                      </span>
                      <span class="muted" style="font-size:11px">·</span>
                      <span style="font-size:12px;color:rgba(240,235,255,.6)">{{ h.detalhe || tipoLabel(h.tipo) }}</span>
                    </p>
                    <p class="drawer-comment-video muted">
                      {{ tipoLabel(h.tipo) }}
                      <span v-if="h.valor_reais"> · {{ Number(h.valor_reais).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</span>
                      · {{ formatDate(h.created_at) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase.js'
import { authState } from '@/auth.js'

const router = useRouter()
const refreshing = ref(false)
const adminAudioEl = ref(null)

onMounted(async () => {
  if (!authState.profile?.is_admin) {
    router.push('/home')
  } else {
    await Promise.all([loadStats(), loadUsers(), loadVideos(), loadComments(), loadProdutos(), loadPedidos(), loadVip()])
  }
  // Atalho global de busca ⌘K / Ctrl+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      document.querySelector('.global-search-input')?.focus()
    }
  })
})

const currentUser = computed(() => authState.profile)

// ── Busca global ──────────────────────────────────────────────
const globalSearch = ref('')
const globalSearchFocused = ref(false)

const globalResults = computed(() => {
  const q = globalSearch.value.toLowerCase().trim()
  if (q.length < 2) return []
  const userMatches = users.value
    .filter(u => u.username?.toLowerCase().includes(q) || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    .slice(0, 4)
    .map(u => ({ ...u, _type: 'user' }))
  const videoMatches = videos.value
    .filter(v => v.titulo?.toLowerCase().includes(q) || v.profiles?.username?.toLowerCase().includes(q))
    .slice(0, 3)
    .map(v => ({ ...v, _type: 'video' }))
  return [...userMatches, ...videoMatches]
})

function handleGlobalResult(r) {
  globalSearch.value = ''
  if (r._type === 'user') {
    activeTab.value = 'users'
    openDrawer(r)
  } else {
    activeTab.value = 'videos'
    openVideoDrawer(r)
  }
}

// ── Tabs ─────────────────────────────────────────────────────
const activeTab = ref('users')
const analyticsRange = ref('30')

const tabs = computed(() => [
  {
    key: 'analytics', label: 'Analytics',
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`
  },
  {
    key: 'users', label: 'Usuários', count: users.value.length,
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`
  },
  {
    key: 'videos', label: 'Vídeos', count: videos.value.length,
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`
  },
  {
    key: 'comments', label: 'Comentários', count: comments.value.length,
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`
  },
  {
    key: 'products', label: 'Produtos', count: produtos.value.length,
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 3h2v2h-2V7zm0 4h2v2h-2v-2zM7 7h2v2H7V7zm0 4h2v2H7v-2zm-2 6l1.5-3h9L17 17H5zm12 0v-2h2v2h-2zm0-4v-2h2v2h-2z"/></svg>`
  },
  {
    key: 'pedidos', label: 'Pedidos', count: pedidos.value.length,
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>`
  },
  {
    key: 'vip', label: 'Lista VIP', count: vipMembros.value.length,
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
  },
])

const currentTabLabel = computed(() => tabs.value.find(t => t.key === activeTab.value)?.label ?? 'Painel')

// ── Stats ─────────────────────────────────────────────────────
const statsData = reactive({ users: null, videos: null, comments: null, likes: null })
const statsLoading = ref(true)
const maxVal = computed(() => Math.max(statsData.users || 0, statsData.videos || 0, statsData.comments || 0, statsData.likes || 0, 1))

const stats = computed(() => [
  {
    label: 'Usuários', value: statsData.users, loading: statsLoading.value,
    accent: '#6366f1', delta: '+12%', deltaType: 'up', pct: `${Math.round((statsData.users||0)/maxVal.value*100)}%`,
    icon: `<svg viewBox="0 0 24 24" fill="#6366f1" width="16" height="16"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`
  },
  {
    label: 'Vídeos', value: statsData.videos, loading: statsLoading.value,
    accent: '#ff2d55', delta: '+8%', deltaType: 'up', pct: `${Math.round((statsData.videos||0)/maxVal.value*100)}%`,
    icon: `<svg viewBox="0 0 24 24" fill="#ff2d55" width="16" height="16"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`
  },
  {
    label: 'Comentários', value: statsData.comments, loading: statsLoading.value,
    accent: '#10b981', delta: '+23%', deltaType: 'up', pct: `${Math.round((statsData.comments||0)/maxVal.value*100)}%`,
    icon: `<svg viewBox="0 0 24 24" fill="#10b981" width="16" height="16"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`
  },
  {
    label: 'Likes', value: statsData.likes, loading: statsLoading.value,
    accent: '#fb923c', delta: '+31%', deltaType: 'up', pct: `${Math.round((statsData.likes||0)/maxVal.value*100)}%`,
    icon: `<svg viewBox="0 0 24 24" fill="#fb923c" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
  },
])

async function loadStats() {
  statsLoading.value = true
  try {
    const [u, v, c, l] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('videos').select('id', { count: 'exact', head: true }),
      supabase.from('comentarios').select('id', { count: 'exact', head: true }),
      supabase.from('likes').select('id', { count: 'exact', head: true }),
    ])
    statsData.users    = u.count
    statsData.videos   = v.count
    statsData.comments = c.count
    statsData.likes    = l.count
  } finally {
    statsLoading.value = false
  }
}

// ── Analytics helpers ─────────────────────────────────────────
const totalPontosVip = computed(() => vipMembros.value.reduce((s, m) => s + (m.pontos ?? 0), 0))

const produtosEstoqueBaixo = computed(() =>
  produtos.value.filter(p => (p.qtd_estoque ?? p.estoque ?? 0) <= 5).sort((a, b) => (a.qtd_estoque ?? a.estoque ?? 0) - (b.qtd_estoque ?? b.estoque ?? 0))
)

function receitaPorStatus(status) {
  const total = pedidos.value.filter(p => p.status === status).reduce((s, p) => s + Number(p.total || 0), 0)
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const receitaTotal = computed(() => {
  const total = pedidos.value.reduce((s, p) => s + Number(p.total || 0), 0)
  return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
})

// ── Exportar CSV ──────────────────────────────────────────────
function exportCSV(type) {
  let rows = []
  let filename = ''

  if (type === 'users') {
    filename = 'usuarios.csv'
    rows = [
      ['ID', 'Username', 'Nome', 'Email', 'Seguidores', 'Admin', 'Banido', 'Criado em'],
      ...users.value.map(u => [u.id, u.username, u.nome, u.email, u.seguidores ?? 0, u.is_admin ? 'Sim' : 'Não', u.banido ? 'Sim' : 'Não', u.created_at])
    ]
  } else if (type === 'videos') {
    filename = 'videos.csv'
    rows = [
      ['ID', 'Título', 'Autor', 'Likes', 'Comentários', 'Reposts', 'Publicado em'],
      ...videos.value.map(v => [v.id, v.titulo, v.profiles?.username, v.likes ?? 0, v.comentarios ?? 0, v.reposts ?? 0, v.created_at])
    ]
  } else if (type === 'comments') {
    filename = 'comentarios.csv'
    rows = [
      ['ID', 'Usuário', 'Texto', 'Vídeo', 'Data'],
      ...comments.value.map(c => [c.id, c.profiles?.username, `"${(c.texto || '').replace(/"/g, '""')}"`, c.videos?.titulo, c.created_at])
    ]
  } else if (type === 'products') {
    filename = 'produtos.csv'
    rows = [
      ['ID', 'Nome', 'Categoria', 'Preço', 'Estoque', 'Ativo', 'Promoção', 'Destaque'],
      ...produtos.value.map(p => [p.id, p.nome, p.categoria, p.preco, p.qtd_estoque ?? p.estoque ?? 0, p.ativo ? 'Sim' : 'Não', p.promo ? 'Sim' : 'Não', p.destaque ? 'Sim' : 'Não'])
    ]
  } else if (type === 'pedidos') {
    filename = 'pedidos.csv'
    rows = [
      ['Número', 'Status', 'Entrega', 'Total', 'Endereço', 'Data'],
      ...pedidos.value.map(p => [p.numero, p.status, p.tipo_entrega, p.total, `"${(p.endereco_entrega || '').replace(/"/g, '""')}"`, p.criado_em])
    ]
  } else if (type === 'vip') {
    filename = 'lista_vip.csv'
    rows = [
      ['Email', 'Pontos', 'Total gasto', 'Entrou em'],
      ...vipMembros.value.map(m => [m.email, m.pontos ?? 0, m.total_gasto ?? 0, m.created_at])
    ]
  }

  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showToast(`${filename} exportado ✓`, 'success')
}

// ── Paginação helpers ─────────────────────────────────────────
const PAGE_SIZE = 20

function paginate(list, page) {
  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const items = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  return { items, total, totalPages }
}

// ── Lista VIP ─────────────────────────────────────────────────
const vipMembros   = ref([])
const loadingVip   = ref(false)
const vipSearch    = ref('')
const vipSort      = ref('created_at')
const vipSortDir   = ref('desc')

async function loadVip() {
  loadingVip.value = true
  try {
    const { data } = await supabase.from('vip_emails').select('*').order('created_at', { ascending: false })
    vipMembros.value = data || []
  } finally {
    loadingVip.value = false
  }
}

function toggleVipSort(field) {
  if (vipSort.value === field) {
    vipSortDir.value = vipSortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    vipSort.value = field
    vipSortDir.value = 'desc'
  }
}

const filteredVip = computed(() => {
  const q = vipSearch.value.toLowerCase()
  let result = q ? vipMembros.value.filter(m => m.email?.toLowerCase().includes(q)) : [...vipMembros.value]
  result.sort((a, b) => {
    let va, vb
    if (vipSort.value === 'pontos') { va = a.pontos ?? 0; vb = b.pontos ?? 0 }
    else if (vipSort.value === 'total_gasto') { va = a.total_gasto ?? 0; vb = b.total_gasto ?? 0 }
    else { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime() }
    return vipSortDir.value === 'desc' ? vb - va : va - vb
  })
  return result
})

// ── VIP Drawer ────────────────────────────────────────────────
const vipDrawer = reactive({ show: false, membro: null, historico: [], loadingHistorico: false })

const tipoLabels = { cadastro: 'Boas-vindas', compra: 'Compra', resgate: 'Resgate de pontos', ajuste: 'Ajuste manual', bonus: 'Bônus' }
function tipoLabel(tipo) {
  return tipoLabels[tipo] || (tipo ? tipo.charAt(0).toUpperCase() + tipo.slice(1) : 'Movimentação')
}

async function openVipDrawer(m) {
  vipDrawer.membro = m
  vipDrawer.historico = []
  vipDrawer.show = true
  vipDrawer.loadingHistorico = true
  const { data } = await supabase.from('vip_list').select('*').eq('email', m.email).order('created_at', { ascending: false })
  vipDrawer.historico = data || []
  vipDrawer.loadingHistorico = false
}

// ── Pedidos ───────────────────────────────────────────────────
const pedidos = ref([])
const loadingPedidos = ref(false)
const pedidoSearch = ref('')
const pedidoStatusFilter = ref('all')

const pedidoDrawer = reactive({
  show: false, pedido: null, salvando: false, erro: '',
  form: { status: '', tipo_entrega: 'proprio', codigo_rastreio_correios: '', lat_entregador: '', lng_entregador: '', etapa_ativa: 0 }
})

const statusOpcoes = [
  { value: 'confirmado', label: 'Confirmado', color: '#6366f1' },
  { value: 'pago',       label: 'Pago',       color: '#fb923c' },
  { value: 'separando',  label: 'Separando',  color: '#facc15' },
  { value: 'em_rota',    label: 'Em rota',    color: '#3b82f6' },
  { value: 'entregue',   label: 'Entregue',   color: '#10b981' },
  { value: 'cancelado',  label: 'Cancelado',  color: '#ff2d55' },
]

const etapaDoStatus = { confirmado: 0, pago: 1, separando: 2, em_rota: 3, entregue: 4, cancelado: 0 }

async function loadPedidos() {
  loadingPedidos.value = true
  try {
    const { data } = await supabase.from('pedidos').select('*, itens_pedido(*)').order('criado_em', { ascending: false })
    pedidos.value = data || []
  } finally {
    loadingPedidos.value = false
  }
}

const filteredPedidos = computed(() => {
  const q = pedidoSearch.value.toLowerCase()
  return pedidos.value.filter(p => {
    const matchStatus = pedidoStatusFilter.value === 'all' || p.status === pedidoStatusFilter.value
    const matchSearch = !q || p.numero?.toLowerCase().includes(q) || p.status?.toLowerCase().includes(q) || p.endereco_entrega?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })
})

function abrirPedidoDrawer(p) {
  pedidoDrawer.pedido = p
  pedidoDrawer.form = {
    status: p.status || 'confirmado',
    tipo_entrega: p.tipo_entrega || 'proprio',
    codigo_rastreio_correios: p.codigo_rastreio_correios || '',
    lat_entregador: p.lat_entregador || '',
    lng_entregador: p.lng_entregador || '',
    etapa_ativa: p.etapa_ativa ?? 0,
  }
  pedidoDrawer.erro = ''
  pedidoDrawer.salvando = false
  pedidoDrawer.show = true
}

async function salvarPedido() {
  pedidoDrawer.salvando = true
  pedidoDrawer.erro = ''
  try {
    const payload = {
      status: pedidoDrawer.form.status,
      tipo_entrega: pedidoDrawer.form.tipo_entrega,
      etapa_ativa: Number(pedidoDrawer.form.etapa_ativa),
      codigo_rastreio_correios: pedidoDrawer.form.tipo_entrega === 'correios' ? pedidoDrawer.form.codigo_rastreio_correios : null,
      lat_entregador: pedidoDrawer.form.tipo_entrega === 'proprio' && pedidoDrawer.form.lat_entregador ? Number(pedidoDrawer.form.lat_entregador) : null,
      lng_entregador: pedidoDrawer.form.tipo_entrega === 'proprio' && pedidoDrawer.form.lng_entregador ? Number(pedidoDrawer.form.lng_entregador) : null,
    }
    const { error } = await supabase.from('pedidos').update(payload).eq('id', pedidoDrawer.pedido.id)
    if (error) throw error
    const idx = pedidos.value.findIndex(x => x.id === pedidoDrawer.pedido.id)
    if (idx !== -1) Object.assign(pedidos.value[idx], payload)
    pedidoDrawer.show = false
    showToast('Pedido atualizado ✓', 'success')
  } catch (e) {
    pedidoDrawer.erro = e.message || 'Erro ao salvar.'
  } finally {
    pedidoDrawer.salvando = false
  }
}

async function refreshAll() {
  refreshing.value = true
  await Promise.all([loadStats(), loadUsers(), loadVideos(), loadComments(), loadProdutos(), loadPedidos(), loadVip()])
  setTimeout(() => refreshing.value = false, 600)
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/admin')
}

// ── Usuários ──────────────────────────────────────────────────
const users = ref([])
const loadingUsers = ref(false)
const userSearch = ref('')
const userVideoCounts = ref({})
const userSort = ref('created_at')
const userSortDir = ref('desc')
const userStatusFilter = ref('all')
const userPage = ref(1)

// Ações em lote
const selectedUsers = ref([])

const allUsersSelected = computed(() => {
  const ids = paginatedUsers.value.items.map(u => u.id)
  return ids.length > 0 && ids.every(id => selectedUsers.value.includes(id))
})

function toggleSelectAllUsers(e) {
  const ids = paginatedUsers.value.items.map(u => u.id)
  if (e.target.checked) {
    selectedUsers.value = [...new Set([...selectedUsers.value, ...ids])]
  } else {
    selectedUsers.value = selectedUsers.value.filter(id => !ids.includes(id))
  }
}

function toggleSelectUser(id) {
  if (selectedUsers.value.includes(id)) {
    selectedUsers.value = selectedUsers.value.filter(x => x !== id)
  } else {
    selectedUsers.value = [...selectedUsers.value, id]
  }
}

async function batchBan(ban) {
  const ids = selectedUsers.value.filter(id => id !== authState.user?.id)
  if (!ids.length) return
  openConfirm({
    title: ban ? `Banir ${ids.length} usuário(s)` : `Desbanir ${ids.length} usuário(s)`,
    desc: ban ? 'As contas selecionadas serão suspensas.' : 'As contas selecionadas serão reativadas.',
    danger: ban,
    action: async () => {
      confirmModal.show = false
      const payload = { banido: ban, banido_em: ban ? new Date().toISOString() : null }
      await supabase.from('profiles').update(payload).in('id', ids)
      ids.forEach(id => {
        const u = users.value.find(x => x.id === id)
        if (u) Object.assign(u, payload)
      })
      selectedUsers.value = []
      showToast(`${ids.length} usuário(s) ${ban ? 'banidos' : 'desbanidos'} ✓`, 'success')
    }
  })
}

function batchDelete() {
  const ids = selectedUsers.value.filter(id => id !== authState.user?.id)
  if (!ids.length) return
  openConfirm({
    title: `Excluir ${ids.length} usuário(s)`,
    desc: 'Esta ação não pode ser desfeita. Todos os dados serão perdidos.',
    danger: true,
    action: async () => {
      confirmModal.show = false
      await supabase.from('profiles').delete().in('id', ids)
      users.value = users.value.filter(u => !ids.includes(u.id))
      selectedUsers.value = []
      await loadStats()
      showToast(`${ids.length} usuário(s) excluídos ✓`, 'success')
    }
  })
}

async function loadUsers() {
  loadingUsers.value = true
  try {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    users.value = data || []
    if (data?.length) {
      const { data: vids } = await supabase.from('videos').select('user_id')
      if (vids) {
        const counts = {}
        vids.forEach(v => { counts[v.user_id] = (counts[v.user_id] || 0) + 1 })
        userVideoCounts.value = counts
      }
    }
  } finally {
    loadingUsers.value = false
  }
}

function toggleUserSort(field) {
  if (userSort.value === field) { userSortDir.value = userSortDir.value === 'desc' ? 'asc' : 'desc' }
  else { userSort.value = field; userSortDir.value = 'desc' }
  userPage.value = 1
}

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase()
  let result = users.value.filter(u => {
    const matchSearch = !q || u.username?.toLowerCase().includes(q) || u.nome?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    const matchStatus = userStatusFilter.value === 'all' ||
      (userStatusFilter.value === 'active' && !u.banido) ||
      (userStatusFilter.value === 'banned' && u.banido) ||
      (userStatusFilter.value === 'admin' && u.is_admin)
    return matchSearch && matchStatus
  })
  result.sort((a, b) => {
    let va, vb
    if (userSort.value === 'videos') { va = userVideoCounts.value[a.id] ?? 0; vb = userVideoCounts.value[b.id] ?? 0 }
    else if (userSort.value === 'seguidores') { va = a.seguidores ?? 0; vb = b.seguidores ?? 0 }
    else { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime() }
    return userSortDir.value === 'desc' ? vb - va : va - vb
  })
  return result
})

const paginatedUsers = computed(() => paginate(filteredUsers.value, userPage.value))

async function toggleAdmin(u) {
  const newVal = !u.is_admin
  const { error } = await supabase.from('profiles').update({ is_admin: newVal }).eq('id', u.id)
  if (error) { showToast('Erro ao atualizar', 'error'); return }
  u.is_admin = newVal
  showToast(newVal ? `@${u.username} agora é admin` : `Admin removido de @${u.username}`, 'success')
}

function confirmDeleteUser(u) {
  openConfirm({
    title: 'Excluir usuário',
    desc: `Tem certeza que quer excluir @${u.username}? Todos os dados serão apagados.`,
    danger: true,
    action: () => deleteUser(u),
  })
}

async function deleteUser(u) {
  confirmModal.show = false
  const { error } = await supabase.from('profiles').delete().eq('id', u.id)
  if (error) { showToast('Erro ao excluir usuário', 'error'); return }
  users.value = users.value.filter(x => x.id !== u.id)
  await loadStats()
  showToast(`@${u.username} excluído`, 'success')
}

function confirmToggleBan(u) {
  if (!u) return
  if (u.banido) {
    openConfirm({ title: 'Desbanir usuário', desc: `Remover o banimento de @${u.username}?`, danger: false, action: () => toggleBan(u) })
  } else {
    openConfirm({ title: 'Banir usuário', desc: `Banir @${u.username}? A conta será suspensa.`, danger: true, action: () => toggleBan(u) })
  }
}

async function toggleBan(u) {
  confirmModal.show = false
  const novoStatus = !u.banido
  const payload = { banido: novoStatus, banido_em: novoStatus ? new Date().toISOString() : null }
  const { error } = await supabase.from('profiles').update(payload).eq('id', u.id)
  if (error) { showToast('Erro ao atualizar usuário', 'error'); return }
  Object.assign(u, payload)
  const idx = users.value.findIndex(x => x.id === u.id)
  if (idx !== -1) Object.assign(users.value[idx], payload)
  if (drawer.show && drawer.user?.id === u.id) Object.assign(drawer.user, payload)
  showToast(novoStatus ? `@${u.username} foi banido` : `@${u.username} foi desbanido`, 'success')
}

// ── Vídeos ────────────────────────────────────────────────────
const videos = ref([])
const loadingVideos = ref(false)
const videoSearch = ref('')
const videoPage = ref(1)

async function loadVideos() {
  loadingVideos.value = true
  try {
    const { data } = await supabase.from('videos').select('*, profiles(username, avatar_url)').order('created_at', { ascending: false }).limit(200)
    videos.value = data || []
  } finally {
    loadingVideos.value = false
  }
}

const filteredVideos = computed(() => {
  const q = videoSearch.value.toLowerCase()
  if (!q) return videos.value
  return videos.value.filter(v => v.titulo?.toLowerCase().includes(q) || v.profiles?.username?.toLowerCase().includes(q))
})

const paginatedVideos = computed(() => paginate(filteredVideos.value, videoPage.value))

function confirmDeleteVideo(v) {
  openConfirm({ title: 'Excluir vídeo', desc: `Excluir "${v.titulo || 'Sem título'}" de @${v.profiles?.username}?`, danger: true, action: () => deleteVideo(v) })
}

async function deleteVideo(v) {
  confirmModal.show = false
  if (v.storage_path) await supabase.storage.from('videos').remove([v.storage_path])
  const { error } = await supabase.from('videos').delete().eq('id', v.id)
  if (error) { showToast('Erro ao excluir vídeo', 'error'); return }
  videos.value = videos.value.filter(x => x.id !== v.id)
  await loadStats()
  showToast('Vídeo excluído', 'success')
}

// ── Comentários ───────────────────────────────────────────────
const comments = ref([])
const loadingComments = ref(false)
const commentPage = ref(1)

async function loadComments() {
  loadingComments.value = true
  try {
    const { data } = await supabase.from('comentarios').select('*, profiles(username), videos(titulo)').order('created_at', { ascending: false }).limit(100)
    comments.value = data || []
  } finally {
    loadingComments.value = false
  }
}

const paginatedComments = computed(() => paginate(comments.value, commentPage.value))

function confirmDeleteComment(c) {
  openConfirm({ title: 'Excluir comentário', desc: `Excluir o comentário de @${c.profiles?.username}?`, danger: true, action: () => deleteComment(c) })
}

async function deleteComment(c) {
  confirmModal.show = false
  const { error } = await supabase.from('comentarios').delete().eq('id', c.id)
  if (error) { showToast('Erro ao excluir comentário', 'error'); return }
  comments.value = comments.value.filter(x => x.id !== c.id)
  await loadStats()
  showToast('Comentário excluído', 'success')
}

// ── Produtos ──────────────────────────────────────────────────
const produtos = ref([])
const loadingProdutos = ref(false)
const produtoSearch = ref('')
const produtoFiltroFlag = ref('all')

async function loadProdutos() {
  loadingProdutos.value = true
  try {
    const { data } = await supabase.from('produtos').select('*').order('criado_em', { ascending: false })
    produtos.value = data || []
  } finally {
    loadingProdutos.value = false
  }
}

const filteredProdutos = computed(() => {
  const q = produtoSearch.value.toLowerCase()
  return produtos.value.filter(p => {
    const matchSearch = !q || p.nome?.toLowerCase().includes(q) || p.categoria?.toLowerCase().includes(q)
    const matchFlag = produtoFiltroFlag.value === 'all' ||
      (produtoFiltroFlag.value === 'ativo' && p.ativo) ||
      (produtoFiltroFlag.value === 'promo' && p.promo) ||
      (produtoFiltroFlag.value === 'destaque' && p.destaque) ||
      (produtoFiltroFlag.value === 'mais_vendido' && p.mais_vendido) ||
      (produtoFiltroFlag.value === 'sem_estoque' && (p.qtd_estoque ?? p.estoque ?? 0) === 0)
    return matchSearch && matchFlag
  })
})

async function toggleProdutoFlag(p, campo) {
  const newVal = !p[campo]
  const { error } = await supabase.from('produtos').update({ [campo]: newVal }).eq('id', p.id)
  if (error) { showToast('Erro ao atualizar', 'error'); return }
  p[campo] = newVal
  showToast('Produto atualizado ✓', 'success')
}

function confirmDeleteProduto(p) {
  openConfirm({ title: 'Excluir produto', desc: `Excluir "${p.nome}"? Esta ação não pode ser desfeita.`, danger: true, action: () => deleteProduto(p) })
}

async function deleteProduto(p) {
  confirmModal.show = false
  const { error } = await supabase.from('produtos').delete().eq('id', p.id)
  if (error) { showToast('Erro ao excluir produto', 'error'); return }
  produtos.value = produtos.value.filter(x => x.id !== p.id)
  showToast('Produto excluído', 'success')
}

const editProdutoDrawer = reactive({
  show: false, modo: 'editar', produto: null, salvando: false, erro: '',
  form: { nome: '', descricao: '', beneficios: '', preco: '', original: '', img: '', categoria: '', qtd_estoque: 0, ativo: true, destaque: false, promo: false, mais_vendido: false }
})

function abrirEditarProduto(p) {
  editProdutoDrawer.modo = 'editar'
  editProdutoDrawer.produto = p
  editProdutoDrawer.form = {
    nome: p.nome || '', descricao: p.descricao || '', beneficios: p.beneficios || '',
    preco: p.preco || '', original: p.original || '', img: p.img || '',
    categoria: p.categoria || '', qtd_estoque: p.qtd_estoque ?? p.estoque ?? 0,
    ativo: p.ativo ?? true, destaque: p.destaque ?? false, promo: p.promo ?? false, mais_vendido: p.mais_vendido ?? false,
  }
  editProdutoDrawer.erro = ''
  editProdutoDrawer.salvando = false
  editProdutoDrawer.show = true
}

function abrirNovoProduto() {
  editProdutoDrawer.modo = 'criar'
  editProdutoDrawer.produto = null
  editProdutoDrawer.form = { nome: '', descricao: '', beneficios: '', preco: '', original: '', img: '', categoria: '', qtd_estoque: 0, ativo: true, destaque: false, promo: false, mais_vendido: false }
  editProdutoDrawer.erro = ''
  editProdutoDrawer.salvando = false
  editProdutoDrawer.show = true
}

async function salvarEdicaoProduto() {
  if (!editProdutoDrawer.form.nome.trim()) { editProdutoDrawer.erro = 'Nome é obrigatório.'; return }
  if (editProdutoDrawer.form.preco === '' || Number.isNaN(Number(editProdutoDrawer.form.preco))) { editProdutoDrawer.erro = 'Preço é obrigatório.'; return }
  editProdutoDrawer.salvando = true
  editProdutoDrawer.erro = ''
  try {
    const payload = {
      nome: editProdutoDrawer.form.nome.trim(), descricao: editProdutoDrawer.form.descricao.trim(),
      beneficios: editProdutoDrawer.form.beneficios.trim(), preco: Number(editProdutoDrawer.form.preco),
      original: editProdutoDrawer.form.original ? Number(editProdutoDrawer.form.original) : null,
      img: editProdutoDrawer.form.img.trim(), categoria: editProdutoDrawer.form.categoria.trim(),
      qtd_estoque: Number(editProdutoDrawer.form.qtd_estoque), estoque: Number(editProdutoDrawer.form.qtd_estoque),
      ativo: editProdutoDrawer.form.ativo, destaque: editProdutoDrawer.form.destaque,
      promo: editProdutoDrawer.form.promo, mais_vendido: editProdutoDrawer.form.mais_vendido,
    }
    if (editProdutoDrawer.modo === 'criar') {
      const { data, error } = await supabase.from('produtos').insert(payload).select().single()
      if (error) throw error
      produtos.value.unshift(data)
      editProdutoDrawer.show = false
      showToast('Produto criado ✓', 'success')
    } else {
      const { error } = await supabase.from('produtos').update(payload).eq('id', editProdutoDrawer.produto.id)
      if (error) throw error
      const idx = produtos.value.findIndex(x => x.id === editProdutoDrawer.produto.id)
      if (idx !== -1) Object.assign(produtos.value[idx], payload)
      editProdutoDrawer.show = false
      showToast('Produto salvo ✓', 'success')
    }
  } catch (e) {
    editProdutoDrawer.erro = e.message || 'Erro ao salvar.'
  } finally {
    editProdutoDrawer.salvando = false
  }
}

// ── Video Drawer ──────────────────────────────────────────────
const videoDrawer = reactive({
  show: false, video: null, tab: 'comments',
  comments: [], likes: [], reposts: [],
  loadingComments: false, loadingLikes: false, loadingReposts: false,
})

async function openVideoDrawer(v) {
  adminAudioEl.value?.pause()  // ← adiciona essa linha
  const { data: full } = await supabase.from('videos').select('*, profiles(username, avatar_url)').eq('id', v.id).single()
  videoDrawer.video = full || v
  videoDrawer.tab = 'comments'
  videoDrawer.comments = []
  videoDrawer.likes = []
  videoDrawer.reposts = []
  videoDrawer.show = true
  videoDrawer.loadingComments = true
  videoDrawer.loadingLikes = true
  videoDrawer.loadingReposts = true
  const [commentsRes, likesRes, repostsRes] = await Promise.all([
    supabase.from('comentarios').select('*, profiles(username)').eq('video_id', v.id).order('created_at', { ascending: false }),
    supabase.from('likes').select('*, profiles(username)').eq('video_id', v.id).order('created_at', { ascending: false }),
    supabase.from('reposts').select('*, profiles(username)').eq('video_id', v.id).order('created_at', { ascending: false }),
  ])
  videoDrawer.comments = commentsRes.data || []
  videoDrawer.loadingComments = false
  videoDrawer.likes = likesRes.data || []
  videoDrawer.loadingLikes = false
  videoDrawer.reposts = repostsRes.data || []
  videoDrawer.loadingReposts = false
}

// ── Comment Drawer ────────────────────────────────────────────
const commentDrawer = reactive({ show: false, comment: null, related: [] })

async function openCommentDrawer(c) {
  commentDrawer.comment = c
  commentDrawer.related = []
  commentDrawer.show = true
  const { data } = await supabase.from('comentarios').select('*, profiles(username)').eq('user_id', c.user_id).eq('video_id', c.video_id).neq('id', c.id).order('created_at', { ascending: false })
  commentDrawer.related = data || []
}

// ── User Drawer ───────────────────────────────────────────────
const drawer = reactive({
  show: false, tab: 'videos', user: null,
  videos: [], comments: [],
  loadingVideos: false, loadingComments: false,
})

async function openDrawer(u) {
  drawer.user = u
  drawer.tab = 'videos'
  drawer.videos = []
  drawer.comments = []
  drawer.show = true
  drawer.loadingVideos = true
  drawer.loadingComments = true
  const [vRes, cRes] = await Promise.all([
    supabase.from('videos').select('*').eq('user_id', u.id).order('created_at', { ascending: false }),
    supabase.from('comentarios').select('*, videos(titulo)').eq('user_id', u.id).order('created_at', { ascending: false }),
  ])
  drawer.videos = vRes.data || []
  drawer.loadingVideos = false
  drawer.comments = cRes.data || []
  drawer.loadingComments = false
}

async function toggleAdminDrawer() {
  if (!drawer.user) return
  await toggleAdmin(drawer.user)
}

// ── Helpers ───────────────────────────────────────────────────
const confirmModal = reactive({ show: false, title: '', desc: '', danger: false, action: null })

function openConfirm({ title, desc, danger, action }) {
  Object.assign(confirmModal, { title, desc, danger, action, show: true })
}

const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Sora:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.admin-wrap {
  display: flex;
  min-height: 100vh;
  background: #07060a;
  color: rgba(240,235,255,.85);
  font-family: 'Sora', sans-serif;
}

/* ── Sidebar ── */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: rgba(255,255,255,.02);
  border-right: 1px solid rgba(255,255,255,.06);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  margin-bottom: 20px;
}

.sidebar-brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(255,255,255,.6);
}

.nav-section-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,.2);
  padding: 0 20px;
  margin-bottom: 6px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  background: none;
  border: none;
  color: rgba(240,235,255,.4);
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
  text-align: left;
  width: 100%;
}

.nav-item:hover { color: rgba(240,235,255,.8); background: rgba(255,255,255,.04); }
.nav-item.active { color: #fff; background: rgba(255,45,85,.1); }
.nav-item.active .nav-icon { color: #ff2d55; }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; }

.nav-count {
  margin-left: auto;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(255,255,255,.07);
  padding: 1px 6px;
  border-radius: 20px;
  color: rgba(240,235,255,.4);
}

.nav-item.active .nav-count { background: rgba(255,45,85,.15); color: #ff2d55; }

.sidebar-footer {
  padding: 16px 14px 0;
  border-top: 1px solid rgba(255,255,255,.05);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-user { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }

.sidebar-avatar {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,45,85,.15);
  border: 1px solid rgba(255,45,85,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #ff2d55;
  flex-shrink: 0;
}

.sidebar-user-name { font-size: 12px; font-weight: 600; color: rgba(240,235,255,.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-user-role { font-size: 10px; color: rgba(240,235,255,.3); margin-top: 1px; }

.logout-btn {
  background: none;
  border: none;
  color: rgba(240,235,255,.25);
  cursor: pointer;
  padding: 6px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  transition: all .15s;
  flex-shrink: 0;
}
.logout-btn:hover { color: #ff2d55; background: rgba(255,45,85,.08); }

/* ── Main ── */
.main { flex: 1; padding: 28px 32px; overflow-y: auto; min-width: 0; }

/* ── Topbar ── */
.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
}

.page-title { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -.4px; }
.page-sub { font-size: 12px; color: rgba(240,235,255,.3); margin-top: 3px; font-weight: 400; text-transform: capitalize; }

.topbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

/* ── Global Search ── */
.global-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.global-search-icon {
  position: absolute;
  left: 10px;
  color: rgba(240,235,255,.25);
  pointer-events: none;
}

.global-search-input {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 10px;
  padding: 7px 60px 7px 28px;
  font-size: 12px;
  font-family: 'Sora', sans-serif;
  color: rgba(240,235,255,.8);
  outline: none;
  width: 260px;
  transition: all .15s;
}
.global-search-input::placeholder { color: rgba(240,235,255,.2); }
.global-search-input:focus { border-color: rgba(255,45,85,.35); background: rgba(255,45,85,.04); width: 300px; }

.search-kbd {
  position: absolute;
  right: 8px;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: rgba(240,235,255,.25);
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 4px;
  padding: 1px 5px;
}

.global-results {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #12101a;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px;
  overflow: hidden;
  z-index: 9999;
  box-shadow: 0 12px 40px rgba(0,0,0,.6);
  min-width: 300px;
}

.global-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background .1s;
}
.global-result-item:hover { background: rgba(255,45,85,.08); }

.global-result-type { font-size: 16px; flex-shrink: 0; }
.global-result-name { font-size: 13px; font-weight: 600; color: rgba(240,235,255,.85); }
.global-result-sub { font-size: 11px; color: rgba(240,235,255,.35); margin-top: 1px; font-family: 'JetBrains Mono', monospace; }

.global-result-empty {
  padding: 14px;
  font-size: 12px;
  color: rgba(240,235,255,.3);
  text-align: center;
}

/* ── Live indicator ── */
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(16,185,129,.4); }
  50% { opacity: .7; box-shadow: 0 0 0 4px rgba(16,185,129,0); }
}

.live-text { font-size: 11px; color: rgba(240,235,255,.3); font-family: 'JetBrains Mono', monospace; }

.refresh-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  color: rgba(240,235,255,.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
}
.refresh-btn:hover { color: #fff; background: rgba(255,255,255,.08); }
.refresh-btn.spinning svg { animation: spin .6s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px 18px 14px;
  background: rgba(255,255,255,.025);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  transition: border-color .2s;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--accent);
  opacity: .5;
}

.stat-card:hover { border-color: rgba(255,255,255,.1); }

.stat-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }

.stat-icon-wrap {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-delta {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 5px;
}
.stat-delta.up { background: rgba(16,185,129,.1); color: #10b981; }
.stat-delta.down { background: rgba(255,45,85,.1); color: #ff2d55; }

.stat-value { font-size: 26px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -.5px; margin-bottom: 4px; }
.stat-label { font-size: 11px; color: rgba(240,235,255,.35); font-weight: 500; margin-bottom: 12px; }

.stat-bar { height: 3px; background: rgba(255,255,255,.05); border-radius: 2px; overflow: hidden; }
.stat-bar-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 1s cubic-bezier(.4,0,.2,1); opacity: .6; }

/* ── Panel ── */
.panel {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 16px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  flex-wrap: wrap;
  gap: 10px;
}

.panel-count { font-size: 12px; color: rgba(240,235,255,.35); font-family: 'JetBrains Mono', monospace; }
.panel-count-sub { color: rgba(240,235,255,.2); }

/* ── Filter select ── */
.filter-select {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 11px;
  font-family: 'Sora', sans-serif;
  color: rgba(240,235,255,.6);
  outline: none;
  cursor: pointer;
}
.filter-select:focus { border-color: rgba(255,45,85,.3); }

/* ── Export button ── */
.export-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 7px;
  background: rgba(16,185,129,.07);
  border: 1px solid rgba(16,185,129,.18);
  color: #10b981;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Sora', sans-serif;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.export-btn:hover { background: rgba(16,185,129,.14); }

/* ── Batch bar ── */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.batch-count {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: rgba(240,235,255,.6);
  background: rgba(255,255,255,.05);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,.08);
}

/* ── Checkbox ── */
.row-checkbox {
  width: 14px; height: 14px;
  cursor: pointer;
  accent-color: #ff2d55;
}

.row-selected { background: rgba(255,45,85,.05) !important; }
.row-selected:hover { background: rgba(255,45,85,.08) !important; }

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,.04);
}

.page-btn {
  width: 30px; height: 30px;
  border-radius: 7px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  color: rgba(240,235,255,.5);
  cursor: pointer;
  font-size: 13px;
  transition: all .15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-btn:hover:not(:disabled) { background: rgba(255,255,255,.08); color: #fff; }
.page-btn:disabled { opacity: .3; cursor: not-allowed; }

.page-info { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: rgba(240,235,255,.35); }

/* ── Analytics ── */
.analytics-metric {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.analytics-metric-val {
  font-size: 28px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.analytics-metric-label {
  font-size: 11px;
  color: rgba(240,235,255,.3);
  font-weight: 500;
}

.analytics-section-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(240,235,255,.5);
  text-transform: uppercase;
  letter-spacing: .7px;
  font-family: 'JetBrains Mono', monospace;
}

.analytics-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.analytics-bar-label {
  font-size: 12px;
  color: rgba(240,235,255,.5);
  width: 80px;
  flex-shrink: 0;
}

.analytics-bar-track {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,.05);
  border-radius: 3px;
  overflow: hidden;
}

.analytics-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width .6s cubic-bezier(.4,0,.2,1);
  opacity: .8;
}

.analytics-bar-count {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  width: 28px;
  text-align: right;
  flex-shrink: 0;
}

/* ── Search ── */
.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 10px; color: rgba(240,235,255,.25); pointer-events: none; }

.search-input {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 8px;
  padding: 6px 12px 6px 28px;
  font-size: 12px;
  font-family: 'Sora', sans-serif;
  color: rgba(240,235,255,.8);
  outline: none;
  width: 200px;
  transition: border-color .15s, background .15s;
}
.search-input::placeholder { color: rgba(240,235,255,.2); }
.search-input:focus { border-color: rgba(255,45,85,.3); background: rgba(255,45,85,.03); }

/* ── Table ── */
.data-table { width: 100%; border-collapse: collapse; min-width: 800px; }

.table-wrap { overflow-x: auto; }

.data-table th {
  font-size: 10px;
  font-weight: 600;
  color: rgba(240,235,255,.25);
  text-transform: uppercase;
  letter-spacing: .7px;
  padding: 9px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,.04);
  font-family: 'JetBrains Mono', monospace;
}

.data-table td {
  padding: 11px 16px;
  font-size: 13px;
  border-bottom: 1px solid rgba(255,255,255,.03);
  vertical-align: middle;
}

.data-table tbody tr { transition: background .1s; }
.data-table tbody tr:hover { background: rgba(255,255,255,.02); }
.data-table tbody tr:last-child td { border-bottom: none; }
.muted { color: rgba(240,235,255,.35); }

/* ── User cell ── */
.user-cell { display: flex; align-items: center; gap: 10px; }

.user-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(255,45,85,.2); flex-shrink: 0; }

.user-avatar-placeholder {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: rgba(255,45,85,.08);
  border: 1.5px solid rgba(255,45,85,.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #ff2d55;
  flex-shrink: 0;
}

.user-name { font-size: 13px; font-weight: 600; color: rgba(240,235,255,.9); }
.user-handle { font-size: 11px; color: rgba(240,235,255,.3); margin-top: 1px; }
.video-title { font-size: 13px; font-weight: 600; color: rgba(240,235,255,.8); }
.video-desc { font-size: 11px; margin-top: 2px; }

/* ── Badges ── */
.badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; font-family: 'JetBrains Mono', monospace; letter-spacing: .3px; }
.badge-admin { background: rgba(255,45,85,.1); color: #ff2d55; border: 1px solid rgba(255,45,85,.2); }
.badge-user  { background: rgba(255,255,255,.04); color: rgba(240,235,255,.3); border: 1px solid rgba(255,255,255,.07); }

/* ── Action buttons ── */
.action-btns { display: flex; gap: 4px; flex-wrap: nowrap; align-items: center; }

.actions-col { white-space: nowrap; }

.icon-btn {
  padding: 4px 8px;
  font-size: 10px;
  white-space: nowrap;
}

.action-btn {
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Sora', sans-serif;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all .15s;
  white-space: nowrap;
}
.action-btn:disabled { opacity: .25; cursor: not-allowed; }

.btn-edit         { background: rgba(16,185,129,.07); color: #10b981; border-color: rgba(16,185,129,.18); }
.btn-edit:hover   { background: rgba(16,185,129,.14); }
.btn-make-admin   { background: rgba(99,102,241,.08); color: #818cf8; border-color: rgba(99,102,241,.2); }
.btn-make-admin:hover:not(:disabled)   { background: rgba(99,102,241,.16); }
.btn-remove-admin { background: rgba(251,146,60,.08); color: #fb923c; border-color: rgba(251,146,60,.2); }
.btn-remove-admin:hover:not(:disabled) { background: rgba(251,146,60,.16); }
.btn-delete       { background: rgba(255,45,85,.07); color: #ff2d55; border-color: rgba(255,45,85,.18); }
.btn-delete:hover:not(:disabled)       { background: rgba(255,45,85,.15); }

/* ── Skeleton ── */
.loading-state { padding: 12px 18px; display: flex; flex-direction: column; gap: 10px; }

.skeleton-row {
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,.03) 25%, rgba(255,255,255,.06) 50%, rgba(255,255,255,.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(6px);
}

.modal {
  background: #0e0b14;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 18px;
  padding: 28px;
  max-width: 360px;
  width: 90%;
  text-align: center;
}

.modal-icon { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
.icon-danger { background: rgba(255,45,85,.1); color: #ff2d55; }
.icon-warn   { background: rgba(251,146,60,.1); color: #fb923c; }

.modal-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
.modal-desc  { font-size: 13px; color: rgba(240,235,255,.45); line-height: 1.6; margin-bottom: 22px; }

.modal-actions { display: flex; gap: 10px; }

.modal-btn {
  flex: 1; padding: 10px;
  border-radius: 10px;
  font-size: 13px; font-weight: 700;
  font-family: 'Sora', sans-serif;
  cursor: pointer; border: none;
  transition: all .15s;
}
.btn-cancel  { background: rgba(255,255,255,.05); color: rgba(240,235,255,.5); }
.btn-cancel:hover  { background: rgba(255,255,255,.09); }
.btn-confirm { background: #ff2d55; color: #fff; }
.btn-confirm:hover { background: #e0253f; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; align-items: center; gap: 8px;
  padding: 11px 18px;
  border-radius: 12px;
  font-size: 13px; font-weight: 600;
  z-index: 99999;
}
.toast.success { background: rgba(16,185,129,.12); border: 1px solid rgba(16,185,129,.25); color: #34d399; }
.toast.error   { background: rgba(255,45,85,.12);  border: 1px solid rgba(255,45,85,.25);  color: #ff2d55; }

/* ── Transitions ── */
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal { transform: scale(.95) translateY(8px); }

.toast-enter-active, .toast-leave-active { transition: all .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }

.clickable-row { cursor: pointer; }
.clickable-row:hover { background: rgba(255,45,85,.04) !important; }

/* ── Drawer ── */
.drawer-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.6);
  z-index: 9998;
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 520px;
  max-width: 95vw;
  height: 100vh;
  background: #0c0a12;
  border-left: 1px solid rgba(255,255,255,.08);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,.06);
  flex-shrink: 0;
}

.drawer-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; min-height: 0; }

.drawer-close {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: rgba(240,235,255,.4);
  font-size: 13px;
  font-family: 'Sora', sans-serif;
  font-weight: 500;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 7px;
  transition: all .15s;
}
.drawer-close:hover { color: rgba(240,235,255,.8); background: rgba(255,255,255,.05); }

.drawer-actions-top { display: flex; gap: 8px; flex-wrap: wrap; }

.drawer-hero {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  flex-shrink: 0;
}

.drawer-avatar-wrap { position: relative; flex-shrink: 0; }

.drawer-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,45,85,.3); }

.drawer-avatar-placeholder {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,45,85,.1);
  border: 2px solid rgba(255,45,85,.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #ff2d55;
}

.drawer-role-badge {
  position: absolute;
  bottom: -2px; right: -2px;
  font-size: 9px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 6px;
  border-radius: 20px;
}

.drawer-name { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -.3px; margin-bottom: 3px; }
.drawer-handle { font-size: 13px; color: rgba(240,235,255,.4); margin-bottom: 3px; font-family: 'JetBrains Mono', monospace; }
.drawer-email { font-size: 12px; color: rgba(240,235,255,.3); margin-bottom: 6px; }
.drawer-bio { font-size: 13px; color: rgba(240,235,255,.55); line-height: 1.5; }

.drawer-stats { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,.05); flex-shrink: 0; }

.drawer-stat { flex: 1; padding: 14px 12px; text-align: center; border-right: 1px solid rgba(255,255,255,.04); }
.drawer-stat:last-child { border-right: none; }
.drawer-stat-val { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 2px; font-family: 'JetBrains Mono', monospace; }
.drawer-stat-label { font-size: 10px; color: rgba(240,235,255,.3); text-transform: uppercase; letter-spacing: .5px; }

.drawer-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: #0c0a12;
  z-index: 1;
}

.drawer-tab {
  flex: 1; padding: 11px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(240,235,255,.35);
  font-size: 12px;
  font-weight: 600;
  font-family: 'Sora', sans-serif;
  cursor: pointer;
  transition: all .15s;
  margin-bottom: -1px;
}
.drawer-tab:hover { color: rgba(240,235,255,.7); }
.drawer-tab.active { color: #ff2d55; border-bottom-color: #ff2d55; }

.drawer-content { flex: 1; padding: 12px; }
.drawer-empty { text-align: center; padding: 40px; color: rgba(240,235,255,.25); font-size: 13px; }

.drawer-video-list { display: flex; flex-direction: column; gap: 8px; }

.drawer-video-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 10px;
  transition: border-color .15s;
}
.drawer-video-item:hover { border-color: rgba(255,255,255,.09); }
.drawer-video-item--clickable { cursor: pointer; }
.drawer-video-item--clickable:hover { border-color: rgba(255,45,85,.25); background: rgba(255,45,85,.04); }

.video-cell { display: flex; align-items: center; gap: 10px; }

.video-thumb-wrap {
  width: 42px; height: 56px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-thumb { width: 100%; height: 100%; object-fit: cover; }
.video-thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }

.engagement-row { display: flex; gap: 8px; flex-wrap: wrap; }

.eng-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 6px;
}
.eng-likes   { color: #ff2d55; background: rgba(255,45,85,.08); }
.eng-comments { color: #818cf8; background: rgba(99,102,241,.08); }
.eng-reposts  { color: #10b981; background: rgba(16,185,129,.08); }

.comment-text-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 260px;
  font-size: 13px;
  line-height: 1.4;
}

.panel-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.sort-wrap { display: flex; gap: 4px; }

.sort-btn {
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  color: rgba(240,235,255,.3);
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.sort-btn:hover { color: rgba(240,235,255,.7); background: rgba(255,255,255,.07); }
.sort-btn.active { color: #ff2d55; background: rgba(255,45,85,.08); border-color: rgba(255,45,85,.2); }

.drawer-video-info { flex: 1; min-width: 0; }
.drawer-video-title { font-size: 13px; font-weight: 600; color: rgba(240,235,255,.85); margin-bottom: 3px; }
.drawer-video-desc { font-size: 11px; margin-bottom: 6px; }
.drawer-video-meta { display: flex; gap: 10px; font-size: 11px; color: rgba(240,235,255,.4); flex-wrap: wrap; }

.drawer-comment-list { display: flex; flex-direction: column; gap: 8px; }

.drawer-comment-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 10px;
  transition: border-color .15s;
}
.drawer-comment-item:hover { border-color: rgba(255,255,255,.09); }

.drawer-comment-info { flex: 1; min-width: 0; }
.drawer-comment-text { font-size: 13px; color: rgba(240,235,255,.8); margin-bottom: 4px; line-height: 1.4; }
.drawer-comment-video { font-size: 11px; }
.drawer-item-del { flex-shrink: 0; align-self: center; }

.drawer-enter-active, .drawer-leave-active { transition: opacity .2s ease; }
.drawer-enter-active .drawer, .drawer-leave-active .drawer { transition: transform .25s cubic-bezier(.4,0,.2,1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }

/* ── Video Drawer ── */
.vd-card { border-bottom: 1px solid rgba(255,255,255,.05); flex-shrink: 0; }
.vd-preview { width: 100%; background: #000; aspect-ratio: 9/16; max-height: 340px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.vd-video { width: 100%; height: 100%; object-fit: contain; }
.vd-thumb-wrap { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.vd-thumb { width: 100%; height: 100%; object-fit: cover; opacity: .7; }
.vd-thumb-label { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-size: 10px; color: rgba(255,255,255,.5); background: rgba(0,0,0,.6); padding: 3px 8px; border-radius: 6px; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
.vd-no-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(240,235,255,.3); font-size: 12px; }
.vd-info { padding: 16px 20px 18px; display: flex; flex-direction: column; gap: 10px; }
.vd-title { font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -.2px; }
.vd-desc { font-size: 13px; color: rgba(240,235,255,.5); line-height: 1.5; }
.vd-author { display: flex; align-items: center; gap: 8px; }
.vd-stats { display: flex; gap: 20px; }
.vd-stat { display: flex; align-items: center; gap: 5px; font-size: 14px; font-weight: 700; color: #fff; font-family: 'JetBrains Mono', monospace; }
.vd-stat-label { font-size: 10px; color: rgba(240,235,255,.3); font-weight: 400; font-family: 'Sora', sans-serif; margin-left: 2px; }

/* ── Comment Drawer ── */
.cd-card { padding: 20px; border-bottom: 1px solid rgba(255,255,255,.05); display: flex; flex-direction: column; gap: 16px; flex-shrink: 0; }
.cd-bubble { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); border-radius: 14px 14px 14px 4px; padding: 14px 16px; }
.cd-text { font-size: 15px; color: rgba(240,235,255,.85); line-height: 1.6; }
.cd-meta { display: flex; flex-direction: column; gap: 12px; }
.cd-author { display: flex; align-items: center; gap: 10px; }
.cd-video-ref { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; background: rgba(255,45,85,.05); border: 1px solid rgba(255,45,85,.12); border-radius: 10px; }
.cd-related { display: flex; flex-direction: column; gap: 8px; }
.cd-related-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .7px; color: rgba(240,235,255,.25); font-family: 'JetBrains Mono', monospace; margin-bottom: 2px; }

/* ── Edit Drawer ── */
.drawer-edit-title { font-size: 14px; font-weight: 600; color: rgba(240,235,255,.7); }

.edit-form { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

.edit-avatar-row { display: flex; align-items: center; gap: 14px; padding: 16px; background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; }
.edit-avatar-name { font-size: 15px; font-weight: 600; color: rgba(240,235,255,.85); margin-bottom: 2px; }
.edit-avatar-handle { font-size: 12px; color: rgba(240,235,255,.3); font-family: 'JetBrains Mono', monospace; }

.edit-field { display: flex; flex-direction: column; gap: 7px; }

.edit-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: rgba(240,235,255,.3);
  font-family: 'JetBrains Mono', monospace;
}

.edit-input {
  width: 100%;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: 'Sora', sans-serif;
  color: rgba(240,235,255,.85);
  outline: none;
  transition: border-color .15s, background .15s;
}
.edit-input:focus { border-color: rgba(255,45,85,.4); background: rgba(255,45,85,.03); }
.edit-input::placeholder { color: rgba(240,235,255,.2); }

.edit-textarea {
  width: 100%;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: 'Sora', sans-serif;
  color: rgba(240,235,255,.85);
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color .15s;
}
.edit-textarea:focus { border-color: rgba(255,45,85,.4); background: rgba(255,45,85,.03); }
.edit-textarea::placeholder { color: rgba(240,235,255,.2); }

.edit-toggle-row { display: flex; gap: 8px; }

.edit-toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
  color: rgba(240,235,255,.35);
  font-size: 13px;
  font-weight: 600;
  font-family: 'Sora', sans-serif;
  cursor: pointer;
  transition: all .15s;
}
.edit-toggle-btn:hover:not(:disabled) { background: rgba(255,255,255,.06); color: rgba(240,235,255,.6); }
.edit-toggle-btn:disabled { opacity: .3; cursor: not-allowed; }
.edit-toggle-btn.active-user { background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.3); color: #818cf8; }
.edit-toggle-btn.active-admin { background: rgba(255,45,85,.1); border-color: rgba(255,45,85,.3); color: #ff2d55; }

.edit-error { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: rgba(255,45,85,.08); border: 1px solid rgba(255,45,85,.2); border-radius: 10px; font-size: 13px; color: #ff2d55; }

.edit-actions { display: flex; gap: 10px; padding-top: 4px; }

.edit-btn { flex: 1; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: 'Sora', sans-serif; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all .15s; }
.edit-btn:disabled { opacity: .5; cursor: not-allowed; }
.edit-btn--cancel { background: rgba(255,255,255,.05); color: rgba(240,235,255,.4); border: 1px solid rgba(255,255,255,.07); }
.edit-btn--cancel:hover { background: rgba(255,255,255,.08); }
.edit-btn--save { background: #ff2d55; color: #fff; }
.edit-btn--save:hover:not(:disabled) { background: #e0253f; }

/* ── Produto ── */
.prod-thumb { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,.07); flex-shrink: 0; }
.prod-thumb-placeholder { width: 38px; height: 38px; border-radius: 8px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.flag-badge {
  font-size: 9px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  padding: 2px 7px;
  border-radius: 5px;
  cursor: pointer;
  transition: all .15s;
  user-select: none;
}
.flag-on  { background: rgba(16,185,129,.12); color: #10b981; border: 1px solid rgba(16,185,129,.25); }
.flag-off { background: rgba(255,255,255,.04); color: rgba(240,235,255,.2); border: 1px solid rgba(255,255,255,.07); }
.flag-badge:hover { opacity: .8; transform: scale(1.05); }

@media (max-width: 900px) {
  .sidebar { display: none; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .main { padding: 16px; }
  .drawer { width: 100vw; }
  .global-search-input { width: 180px; }
}
</style>