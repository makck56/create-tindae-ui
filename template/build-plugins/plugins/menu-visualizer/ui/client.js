const { createApp, ref } = Vue;

// Recursive Component for Tree
const MenuTree = {
  name: 'MenuTree',
  props: ['tasks', 'selectedId', 'routeTree'],
  emits: ['select', 'delete'],
  setup(props) {
    const isInvalidRoute = (item) => {
        if (!item.routeName) return false;
        // 格式: ROUTE_NAMES.Domain.Key
        const parts = item.routeName.split('.');
        if (parts.length !== 3) return true;
        
        const domain = parts[1];
        const key = parts[2];
        const domainRoutes = props.routeTree[domain];
        if (!domainRoutes) return true;
        return !domainRoutes.some(r => r.key === key);
    };
    return { isInvalidRoute };
  },
  template: `
    <ul class="menu-tree">
      <li v-for="element in tasks" :key="element.id" class="menu-item" :class="{ active: element.id === selectedId }">
        <div class="menu-item-content" 
             :class="{ 'invalid-route': isInvalidRoute(element) }"
             @click.stop="$emit('select', element)">
          <i v-if="element.children && element.children.length" class="ri-folder-3-fill" style="color: #faad14;"></i>
          <i v-else-if="element.icon" class="ri-menu-line" style="color: #1890ff;"></i>
          <i v-else class="ri-file-list-line" style="color: #999;"></i>
          <span style="flex: 1; font-weight: 500;">
            {{ element.label || '未命名菜单' }}
            <i v-if="isInvalidRoute(element)" class="ri-error-warning-fill" style="color: #ff4d4f; margin-left: 4px;" title="失效路由"></i>
          </span>
          <span v-if="element.routeName" class="badge">ROUTE</span>
          <i class="ri-delete-bin-line delete-btn" @click.stop="$emit('delete', element)" title="删除"></i>
        </div>
        <div class="menu-children">
          <menu-tree :tasks="element.children" :route-tree="routeTree" @select="$emit('select', $event)" @delete="$emit('delete', $event)" :selected-id="selectedId" />
        </div>
      </li>
    </ul>
  `,
  mounted() {}
};

createApp({
  components: { MenuTree },
  setup() {
    console.log('Menu Visualizer UI v4 (Delete Feature)'); 
    
    const routeTree = ref({});
    const menuData = ref([]);
    const selectedItem = ref(null);
    const imports = ref('');

    // Mock ROUTE_NAMES for eval
    const ROUTE_NAMES_PROXY = new Proxy({}, {
      get: (target, prop) => new Proxy({}, {
        get: (t, p) => `ROUTE_NAMES.${prop}.${p}`
      })
    });

    const enrichLabels = (items, tree) => {
        items.forEach(item => {
            // 如果没有 Label 但有 RouteName，尝试自动补全
            if (!item.label && item.routeName && typeof item.routeName === 'string') {
                // routeName 格式: "ROUTE_NAMES.Domain.Key"
                const parts = item.routeName.split('.');
                if (parts.length === 3 && parts[0] === 'ROUTE_NAMES') {
                    const domain = parts[1];
                    const key = parts[2];
                    
                    const domainRoutes = tree[domain];
                    if (domainRoutes) {
                         const routeDef = domainRoutes.find(r => r.key === key);
                         if (routeDef && (routeDef.comment || routeDef.value)) {
                             // 优先使用注释，否则使用路由名
                             item.label = routeDef.comment || routeDef.value;
                         }
                    }
                }
            }
            
            if (item.children) {
                enrichLabels(item.children, tree);
            }
        });
    };

    const loadData = async () => {
      // Load Routes
      const resRoutes = await fetch('/__menu-api/get-route-names').then(r => r.json());
      if (resRoutes.tree) {
          routeTree.value = resRoutes.tree;
      }

      // Load Menu (AST based)
      try {
          const resMenu = await fetch('/__menu-api/get-menu').then(r => r.json());
          if (resMenu.error) {
              throw new Error(resMenu.error);
          }
          
          imports.value = resMenu.imports || '';
          
          // Eval with mocked ROUTE_NAMES
          console.log('Code to eval:', resMenu.code);
          
          const evalFn = new Function('ROUTE_NAMES', `return ${resMenu.code}`);
          const data = evalFn(ROUTE_NAMES_PROXY);
          
          const dataWithIds = addIds(data);
          
          if (routeTree.value) {
              enrichLabels(dataWithIds, routeTree.value);
          }
          
          menuData.value = dataWithIds;
      } catch (e) {
          console.error('Load error', e);
          alert('加载配置失败: ' + e.message);
      }
    };

    const addIds = (items) => {
      return items.map(item => {
        item.id = Math.random().toString(36).substr(2, 9);
        if (item.children) item.children = addIds(item.children);
        return item;
      });
    };

    const selectItem = (item) => {
      selectedItem.value = item;
    };

    const addRootItem = () => {
      const newItem = { id: Date.now().toString(), label: '新根菜单', children: [] };
      menuData.value.push(newItem);
      selectItem(newItem);
    };

    const addRouteToMenu = (domain, route) => {
      const targetRouteName = `ROUTE_NAMES.${domain}.${route.key}`;

      // Check for duplicates
      const checkExists = (items) => {
          for (const item of items) {
              if (item.routeName === targetRouteName) return true;
              if (item.children && checkExists(item.children)) return true;
          }
          return false;
      };

      if (checkExists(menuData.value)) {
          alert('该路由已添加到菜单中，请勿重复添加');
          return;
      }

      const newItem = {
          id: Math.random().toString(36).substr(2, 9),
          label: route.comment || route.value,
          routeName: targetRouteName,
          children: []
      };

      if (selectedItem.value) {
          if (!selectedItem.value.children) selectedItem.value.children = [];
          selectedItem.value.children.push(newItem);
      } else {
          menuData.value.push(newItem);
          selectItem(newItem);
      }
    };

    const deleteItem = (itemToDelete) => {
        if (!confirm(`确认删除 "${itemToDelete.label || '此菜单'}" 吗？`)) return;

        const remove = (items) => {
            const idx = items.findIndex(i => i.id === itemToDelete.id);
            if (idx > -1) {
                items.splice(idx, 1);
                return true;
            }
            for (const item of items) {
                if (item.children && remove(item.children)) return true;
            }
            return false;
        };
        
        remove(menuData.value);
        if (selectedItem.value && selectedItem.value.id === itemToDelete.id) {
            selectedItem.value = null;
        }
    };

    const deleteCurrent = () => {
      if (!selectedItem.value) return;
      deleteItem(selectedItem.value);
    };

    const moveItem = (direction) => {
       if (!selectedItem.value) return;
       const move = (items) => {
           const idx = items.findIndex(i => i.id === selectedItem.value.id);
           if (idx > -1) {
               const newIdx = idx + direction;
               if (newIdx >= 0 && newIdx < items.length) {
                   const temp = items[idx];
                   items[idx] = items[newIdx];
                   items[newIdx] = temp;
               }
               return true;
           }
           for (const item of items) {
               if (item.children && move(item.children)) return true;
           }
           return false;
       };
       move(menuData.value);
    };

    const generateCode = () => {
      const serialize = (items) => {
        return items.map(item => {
          const obj = { ...item };
          delete obj.id; // Remove internal ID
          if (obj.children && obj.children.length === 0) delete obj.children;
          if (obj.children) obj.children = serialize(obj.children);
          return obj;
        });
      };
      
      const cleanData = serialize(menuData.value);
      
      const jsonStr = JSON.stringify(cleanData, null, 4);
      
      // Regex to find "ROUTE_NAMES.X.Y" and remove quotes
      const finalStr = jsonStr.replace(/"(ROUTE_NAMES\.[a-zA-Z0-9_.]+)"/g, '$1');
      
      return finalStr; 
    };

    const save = async () => {
      const code = generateCode();
      await fetch('/__menu-api/save-menu', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      alert('保存成功');
    };

    // Init
    loadData();

    // 监听 HMR 事件
    if (window.importMetaHot || (window.__vite_plugin_menu_visualizer_hmr_registered !== true)) {
        window.__vite_plugin_menu_visualizer_hmr_registered = true;
        // Vite 客户端注入后会触发这个全局变量的变化吗？
        // 实际上我们可以通过 import.meta.hot (如果 client.js 是 module)
        // 但这里是普通 script。我们可以利用 window.__vite_plugin_api 这种模式。
        // 最稳妥的方法是直接通过 window.addEventListener 或者监听 Vite 的 custom event
        
        // 尝试通过 Vite 的客户端监听
        try {
            // Vite 会把 custom event 派发到 document
            window.addEventListener('vite:custom', (e) => {
                if (e.detail.type === 'menu-config-update') {
                    console.log('HMR: menu.config.ts changed, reloading...');
                    loadData();
                }
            });
        } catch {}
    }

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    });

    return {
      routeTree,
      menuData,
      selectedItem,
      selectItem,
      addRootItem,
      addRouteToMenu,
      deleteCurrent,
      deleteItem,
      moveItem,
      save
    };
  }
}).mount('#app');