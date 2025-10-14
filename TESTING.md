# Guía de Testing - Museo del Tiempo

Este proyecto está configurado para testing multiplataforma con Jest y Playwright.

## Configuración de Testing

### Jest (Pruebas Unitarias)

- **Configuración**: `jest.config.js`
- **Entorno**: jsdom para simular DOM
- **Setup**: `test/setup.ts` con mocks para framer-motion y HTMLMediaElement
- **Ubicación**: `src/**/__tests__/`

### Playwright (Pruebas E2E)

- **Configuración**: `playwright.config.ts`
- **Ubicación**: `tests/e2e/`
- **Dispositivos**: Desktop Chrome, Firefox, Safari, iPhone 14 Pro

## Scripts Disponibles

```bash
# Pruebas unitarias
npm run test              # Ejecutar todas las pruebas unitarias
npm run test:watch        # Modo watch para desarrollo
npm run test:ci           # Modo CI con reportes

# Pruebas E2E
npm run test:e2e          # Ejecutar todas las pruebas E2E
npm run test:e2e:ui       # Interfaz gráfica de Playwright
npm run test:e2e:debug    # Modo debug
npm run test:iphone       # Solo iPhone 14 Pro
npm run test:compat       # iPhone + Safari + Chrome

# Todas las pruebas
npm run test:all          # Jest + Playwright
```

## Compatibilidad Móvil (iPhone/Safari)

### Problemas Solucionados

1. **Autoplay de Audio**:

   - Requiere interacción del usuario antes de reproducir
   - Manejo de errores con try/catch
   - Atributos `playsInline` y `webkit-playsinline`

2. **Framer Motion**:

   - Mocks que filtran props específicas (whileHover, whileTap, etc.)
   - Evita timers en tests unitarios

3. **HTMLMediaElement**:
   - Mocks de `play()`, `pause()`, `load()`
   - Compatibilidad con AudioContext y webkitAudioContext

### Tests de Compatibilidad

Los tests E2E verifican:

- ✅ Renderizado correcto en iPhone 14 Pro
- ✅ Navegación por décadas con gestos táctiles
- ✅ AudioPlayer con atributos correctos para Safari
- ✅ Interacciones táctiles (tap, scroll)
- ✅ Compatibilidad con WebKit (Safari Desktop)
- ✅ Funcionamiento en Chrome y Firefox

## Ejecutar Tests

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# En otra terminal, ejecutar tests
npm run test:all
```

### Solo iPhone

```bash
npm run test:iphone
```

### Debug

```bash
npm run test:e2e:debug
```

## Estructura de Archivos

```
├── test/
│   └── setup.ts                 # Configuración Jest con mocks
├── tests/
│   └── e2e/
│       └── compat.spec.ts       # Tests E2E multiplataforma
├── src/
│   └── **/__tests__/            # Tests unitarios
├── jest.config.js               # Configuración Jest
├── playwright.config.ts         # Configuración Playwright
└── package.json                 # Scripts de testing
```

## Troubleshooting

### Audio no reproduce en iPhone

- Verificar que el usuario haya interactuado con la página
- Comprobar atributos `playsInline` en elemento audio
- Revisar consola para errores de autoplay

### Tests fallan en Safari

- Verificar que no hay errores de JavaScript
- Comprobar compatibilidad de APIs web
- Revisar mocks de AudioContext

### Playwright no encuentra elementos

- Usar `page.waitForLoadState('networkidle')`
- Verificar selectores específicos para móvil
- Comprobar que el servidor esté ejecutándose
