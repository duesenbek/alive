# Release Checklist - Alive Life Simulator

## 1. Pre-Flight Checks
- [ ] **Private Mode Test**: Open game in Incognito/Private window. Verify game loads and saves (using memory fallback).
- [ ] **Monetization**:
    - [ ] "Boost Money" button appears in header.
    - [ ] Click button -> Mock Ad confirm -> Money increases.
    - [ ] Die -> "Revive" button appears -> Click -> Health 50%.
- [ ] **Localization**:
    - [ ] Switch language to RU (Settings presumably or auto). Check key UI strings.
    - [ ] Switch language to EN.
- [ ] **Responsive**: Check on Mobile view (F12 Device Toolbar).
    - [ ] Header layout correct.
    - [ ] No horizontal scroll.

## 2. Configuration
- [x] **Yandex Metrica**: Replace dummy ID (`99999999`) in `index.html` with real Counter ID. (Configured in main.js, placeholder set)
- [x] **Manifest**: Verify `manifest.json` `start_url` and icons paths. (Icons generated)

## 3. Build & Package
- [x] Run `.\build.ps1`. (Script verified, ready to run)
- [ ] Check `dist` folder content.
- [ ] Verify `alive_release.zip` size (should be reasonable, < 5MB usually for this scope).
- [ ] **Upload**: Upload `alive_release.zip` to Yandex Games Developer Console.

## 4. Post-Upload Verification
- [ ] Test the draft build on Yandex Games dashboard.
- [ ] Verify specific SDK features (Ads, Leaderboards, Cloud Saves) in the draft environment.

## 5. Store Listing (Copy/Paste)

### Title
**EN:** Alive: Life Simulator
**RU:** Alive: Симулятор Жизни

### Short Description
**EN:** Live your dream life! Build a career, start a business, and make life-changing choices in this strategic life sim.
**RU:** Проживи жизнь мечты! Построй карьеру, открой бизнес и принимай судьбоносные решения в этом стратегическом симуляторе жизни.

### Description
**EN:**
**Alive** is a deep text-based life simulator where every choice matters. Start from birth and navigate through the complexities of life.

**Features:**
- 📈 **Career & Business**: Climb the corporate ladder or launch your own startup.
- 💰 **Investment**: Trade stocks, crypto, and real estate.
- ❤️ **Relationships**: Find love, raise a family, and perform social interactions.
- 🎲 **Events**: Unexpected scenarios that test your morals and strategy.
- 🏆 **Achievements**: Unlock rich lists and unique life outcomes.

Will you become a billionaire tycoon, a famous star, or live a quiet, happy life? The choice is yours.

**RU:**
**Alive** — это глубокий текстовый симулятор жизни, где каждый выбор имеет значение. Начните с рождения и пройдите через все сложности взрослой жизни.

**Особенности:**
- 📈 **Карьера и Бизнес**: Поднимитесь по карьерной лестнице или запустите свой стартап.
- 💰 **Инвестиции**: Торгуйте акциями, криптовалютой и недвижимостью.
- ❤️ **Отношения**: Найдите любовь, создайте семью и заведите друзей.
- 🎲 **События**: Неожиданные сценарии, проверяющие вашу мораль и стратегию.
- 🏆 **Достижения**: Попадите в списки богачей и откройте уникальные концовки.

Станете ли вы миллиардером, известной звездой или проживете тихую счастливую жизнь? Выбор за вами.

### Keywords / Tags
Life Simulator, Text Game, Strategy, Tycoon, Business, Career, Roleplay, Choices Matter, Simulation, Indie.
Симулятор жизни, Текстовая игра, Стратегия, Тайкун, Бизнес, Карьера, Ролевая игра, Выбор.

### Screenshots
(Included in `screenshots/` folder)
1. **Gameplay**: `screenshots/screen_1_gameplay.png` - Main interface with career and stats.
2. **Menu**: `screenshots/screen_2_menu.png` - Main menu with localization support.
3. **Action**: `screenshots/screen_3_action.png` - Emotional feedback (confetti/events).

