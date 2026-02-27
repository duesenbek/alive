/**
 * Actions Module - Alive Life Simulator
 * Yearly free actions chosen by the player before random events
 */
(function (global) {
  const Alive = (global.Alive = global.Alive || {});

  function clamp(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

    function diminishingReturn(baseGain, currentSkill, timesUsed) {
    if (baseGain <= 0) return baseGain;
    const skill = clamp(currentSkill || 0, 0, 100);
    const uses = Math.max(0, timesUsed || 0);
    const skillFactor = 1 - (skill / 130);
    const usageFactor = 1 / (1 + uses * 0.05);
    return Math.max(1, Math.round(baseGain * Math.max(0.15, skillFactor * usageFactor)));
  }

  function getUsageCount(player, actionId) {
    if (!player) return 0;
    player.actionUsageCounts = player.actionUsageCounts || {};
    return player.actionUsageCounts[actionId] || 0;
  }

  function incrementUsage(player, actionId) {
    if (!player) return;
    player.actionUsageCounts = player.actionUsageCounts || {};
    player.actionUsageCounts[actionId] = (player.actionUsageCounts[actionId] || 0) + 1;
  }

  function getSocialIncome(player) {
    if (!player) return 0;
    const socialSkill = clamp(player.socialSkill || 0, 0, 100);
    const followers = Math.max(0, Math.floor(Number(player.followers) || 0));
    let income = 0;
    if (socialSkill >= 60) {
      income += Math.round(500 + (socialSkill - 60) * 37.5);
    }
    if (followers >= 10000) {
      const tier = Math.min(followers / 10000, 10);
      income += Math.round(tier * 2400);
    }
    return income;
  }

  function getActionMaxCount(player) {
    if (!player) return 1;
    return player.age >= 14 ? 2 : 1;
  }

  const EFFECT_ICONS = {
    moneyDelta: "??",
    intelligenceDelta: "??",
    healthDelta: "??",
    happinessDelta: "??",
    stressDelta: "??",
    followersDelta: "??",
    relationshipScoreDelta: "??",
    sportsSkillDelta: "???",
    businessSkillDelta: "??",
    investingSkillDelta: "??",
    careerSkillDelta: "??",
    socialSkillDelta: "??",
    hobbySkillDelta: "??"
  };

  function patchI18n() {
    const i18n = Alive.i18n;
    if (!i18n || !i18n.texts) return;
    const en = (i18n.texts.en = i18n.texts.en || {});
    const ru = (i18n.texts.ru = i18n.texts.ru || {});

    Object.assign(en, {
      "action.practice_hobby.title": "Practice hobby",
      "action.practice_hobby.desc": "Practice your main hobby and improve your skill.",
      "action.browse_houses.title": "Browse houses",
      "action.browse_houses.desc": "See what housing you can afford this year.",
      "action.browse_cars.title": "Browse cars",
      "action.browse_cars.desc": "Compare cars available in your city.",
      "action.call_family.title": "Call family",
      "action.call_family.desc": "Call your parents or siblings and stay connected.",
      "action.visit_family.title": "Visit family",
      "action.visit_family.desc": "Spend time with family in person.",
      "action.hangout_friends.title": "Hang out with friends",
      "action.hangout_friends.desc": "Recharge your social life and deepen friendships.",
      "action.make_friends.title": "Make new friends",
      "action.make_friends.desc": "Try to meet new people and expand your social circle.",
      "action.adopt_pet.title": "Adopt a pet",
      "action.adopt_pet.desc": "Bring a pet into your life. Costs money each year.",
      "action.adopt_dog.title": "Adopt a dog",
      "action.adopt_dog.desc": "Get a loyal companion. Dogs need walks and care.",
      "action.adopt_cat.title": "Adopt a cat",
      "action.adopt_cat.desc": "Get a furry friend. Cats are independent but loving.",
      "action.walk_dog.title": "Walk dog",
      "action.walk_dog.desc": "Go for a walk with your dog.",
      "action.play_with_pet.title": "Play with pet",
      "action.play_with_pet.desc": "Play with your pet and strengthen your bond.",

      // Skill-building actions
      "action.gym_workout.title": "Gym workout",
      "action.gym_workout.desc": "Hit the gym and build your fitness.",
      "action.join_sports_team.title": "Join sports team",
      "action.join_sports_team.desc": "Join a local sports team for fitness and friends.",
      "action.marathon_training.title": "Marathon training",
      "action.marathon_training.desc": "Train for a marathon. Requires sports skill 30+.",

      "action.read_business_books.title": "Read business books",
      "action.read_business_books.desc": "Learn from successful entrepreneurs.",
      "action.business_seminar.title": "Attend business seminar",
      "action.business_seminar.desc": "Network and learn at a business event.",
      "action.network_events.title": "Network at events",
      "action.network_events.desc": "Build professional connections.",
      "action.side_project.title": "Start side project",
      "action.side_project.desc": "Work on a side business idea.",

      "action.study_investing.title": "Study investing",
      "action.study_investing.desc": "Learn about markets and investing strategies.",
      "action.follow_markets.title": "Follow markets",
      "action.follow_markets.desc": "Track stocks and market trends.",
      "action.paper_trading.title": "Paper trading",
      "action.paper_trading.desc": "Practice trading without real money.",
      "action.investment_course.title": "Investment course",
      "action.investment_course.desc": "Take a professional investing course.",

      "action.professional_dev.title": "Professional development",
      "action.professional_dev.desc": "Improve your work skills and knowledge.",
      "action.get_certification.title": "Get certification",
      "action.get_certification.desc": "Earn a professional certification.",
      "action.mentor_junior.title": "Mentor someone",
      "action.mentor_junior.desc": "Help a junior colleague grow.",
      "action.work_overtime.title": "Work overtime",
      "action.work_overtime.desc": "Put in extra hours for more pay and experience.",

      "action.join_club.title": "Join a club",
      "action.join_club.desc": "Join a social club or group.",
      "action.public_speaking.title": "Public speaking",
      "action.public_speaking.desc": "Practice speaking in front of groups.",
      "action.volunteer_work.title": "Volunteer work",
      "action.volunteer_work.desc": "Help others and feel good.",
      "action.host_party.title": "Host a party",
      "action.host_party.desc": "Throw a party for friends.",

      "action.learn_music.title": "Learn music",
      "action.learn_music.desc": "Practice playing an instrument.",
      "action.learn_art.title": "Learn art",
      "action.learn_art.desc": "Express yourself through art.",
      "action.learn_coding.title": "Learn coding",
      "action.learn_coding.desc": "Build software and apps.",
      "action.learn_cooking.title": "Learn cooking",
      "action.learn_cooking.desc": "Master the culinary arts.",
      "action.learn_gaming.title": "Play video games",
      "action.learn_gaming.desc": "Relax and have fun gaming.",
      "action.learn_photography.title": "Learn photography",
      "action.learn_photography.desc": "Capture beautiful moments.",
      "action.learn_writing.title": "Learn writing",
      "action.learn_writing.desc": "Write stories or articles.",

      // Needs-focused actions
      "action.take_vacation.title": "Take vacation",
      "action.take_vacation.desc": "Take a break from everything and recharge.",
      "action.see_therapist.title": "See therapist",
      "action.see_therapist.desc": "Talk to a professional about your mental health.",
      "action.take_nap.title": "Take a nap",
      "action.take_nap.desc": "Rest and recover your energy.",
      "action.go_shopping.title": "Go shopping",
      "action.go_shopping.desc": "Buy things to improve your comfort and mood.",
      "action.stay_home_relax.title": "Stay home and relax",
      "action.stay_home_relax.desc": "Enjoy the comfort of your home.",
      "action.throw_party.title": "Throw a party",
      "action.throw_party.desc": "Invite friends over for fun and socializing.",
      "action.spa_day.title": "Spa day",
      "action.spa_day.desc": "Treat yourself to relaxation and pampering."
    });

    Object.assign(ru, {
      "action.practice_hobby.title": "Практиковать хобби",
      "action.practice_hobby.desc": "Практикуйте главное хобби и улучшайте навык.",
      "action.browse_houses.title": "Смотреть жильё",
      "action.browse_houses.desc": "Посмотрите, какое жильё вы можете позволить.",
      "action.browse_cars.title": "Смотреть машины",
      "action.browse_cars.desc": "Сравните машины, доступные в вашем городе.",
      "action.call_family.title": "Позвонить семье",
      "action.call_family.desc": "Позвоните родителям или братьям/сёстрам.",
      "action.visit_family.title": "Навестить семью",
      "action.visit_family.desc": "Проведите время с вашей семьёй.",
      "action.hangout_friends.title": "Встретиться с друзьями",
      "action.hangout_friends.desc": "Восстановите социальную жизнь и укрепите дружбу.",
      "action.make_friends.title": "Завести друзей",
      "action.make_friends.desc": "Познакомьтесь с новыми людьми и расширьте круг общения.",
      "action.adopt_pet.title": "Завести питомца",
      "action.adopt_pet.desc": "Заведите домашнего питомца, но будьте готовы к тратам каждый год.",
      "action.adopt_dog.title": "Завести собаку",
      "action.adopt_dog.desc": "Верный друг. Собаки требуют прогулок и ухода.",
      "action.adopt_cat.title": "Завести кота",
      "action.adopt_cat.desc": "Пушистый друг. Коты независимы, но ласковы.",
      "action.walk_dog.title": "Погулять с собакой",
      "action.walk_dog.desc": "Прогуляйтесь с собакой.",
      "action.play_with_pet.title": "Поиграть с питомцем",
      "action.play_with_pet.desc": "Поиграйте с питомцем и укрепите связь.",
      "action.gym_workout.title": "Тренировка в зале",
      "action.gym_workout.desc": "Занимайтесь и улучшайте форму.",
      "action.join_sports_team.title": "Вступить в команду",
      "action.join_sports_team.desc": "Присоединитесь к спортивной команде.",
      "action.marathon_training.title": "Подготовка к марафону",
      "action.marathon_training.desc": "Подготовьтесь для марафона. Нужен навык спорта 30+.",
      "action.read_business_books.title": "Читать бизнес-книги",
      "action.read_business_books.desc": "Учитесь у успешных предпринимателей.",
      "action.business_seminar.title": "Бизнес-семинар",
      "action.business_seminar.desc": "Нетворкинг и обучение на бизнес-мероприятии.",
      "action.network_events.title": "Нетворкинг",
      "action.network_events.desc": "Стройте профессиональные связи.",
      "action.side_project.title": "Побочный проект",
      "action.side_project.desc": "Работайте над бизнес-идеей.",
      "action.study_investing.title": "Изучать инвестиции",
      "action.study_investing.desc": "Изучайте рынки и стратегии инвестирования.",
      "action.follow_markets.title": "Следить за рынками",
      "action.follow_markets.desc": "Отслеживайте акции и тренды.",
      "action.paper_trading.title": "Бумажная торговля",
      "action.paper_trading.desc": "Практика торговли без реальных денег.",
      "action.investment_course.title": "Курс инвестирования",
      "action.investment_course.desc": "Пройти профессиональный курс.",
      "action.professional_dev.title": "Профессиональное развитие",
      "action.professional_dev.desc": "Улучшите рабочие навыки и знания.",
      "action.get_certification.title": "Получить сертификат",
      "action.get_certification.desc": "Получите профессиональный сертификат.",
      "action.mentor_junior.title": "Наставничество",
      "action.mentor_junior.desc": "Помогите коллеге расти карьерно.",
      "action.work_overtime.title": "Работать сверхурочно",
      "action.work_overtime.desc": "Работайте больше за дополнительную плату.",
      "action.join_club.title": "Вступить в клуб",
      "action.join_club.desc": "Присоединитесь к социальному клубу.",
      "action.public_speaking.title": "Публичное выступление",
      "action.public_speaking.desc": "Практикуйте выступления перед публикой.",
      "action.volunteer_work.title": "Волонтёрство",
      "action.volunteer_work.desc": "Помогайте другим и чувствуйте себя хорошо.",
      "action.host_party.title": "Устроить вечеринку",
      "action.host_party.desc": "Организуйте вечеринку для друзей.",
      "action.learn_music.title": "Учиться музыке",
      "action.learn_music.desc": "Практикуйте игру на инструменте.",
      "action.learn_art.title": "Учиться рисованию",
      "action.learn_art.desc": "Выразите себя через искусство.",
      "action.learn_coding.title": "Учиться программированию",
      "action.learn_coding.desc": "Создавайте программы и приложения.",
      "action.learn_cooking.title": "Учиться готовить",
      "action.learn_cooking.desc": "Освойте кулинарное искусство.",
      "action.learn_gaming.title": "Играть в игры",
      "action.learn_gaming.desc": "Расслабьтесь и развлекитесь.",
      "action.learn_photography.title": "Учиться фотографии",
      "action.learn_photography.desc": "Запечатлейте красивые моменты.",
      "action.learn_writing.title": "Учиться письму",
      "action.learn_writing.desc": "Пишите рассказы или статьи.",
      "action.take_vacation.title": "Отпуск",
      "action.take_vacation.desc": "Отдохните от всего и восстановите силы.",
      "action.see_therapist.title": "Терапевт",
      "action.see_therapist.desc": "Поговорите с профессионалом о психическом здоровье.",
      "action.take_nap.title": "Вздремнуть",
      "action.take_nap.desc": "Отдохните и восстановите энергию.",
      "action.go_shopping.title": "Шопинг",
      "action.go_shopping.desc": "Купите вещи для комфорта и настроения.",
      "action.stay_home_relax.title": "Отдых дома",
      "action.stay_home_relax.desc": "Насладитесь комфортом своего дома.",
      "action.throw_party.title": "Устроить вечеринку",
      "action.throw_party.desc": "Пригласите друзей для общения.",
      "action.spa_day.title": "Спа-день",
      "action.spa_day.desc": "Побалуйте себе расслаблением."
    });
  }

  patchI18n();

  const actions = [
    {
      id: "work_harder",
      icon: "??",
      titleKey: "action.work_harder.title",
      descKey: "action.work_harder.desc",
      previewEffects: [
        { type: "moneyDelta", value: "+" },
        { type: "stressDelta", value: "+" },
        { type: "careerSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 14;
      },
      apply({ player }) {
        if (!player) return;
        const income = Math.max(0, player.annualIncome || player.getJobIncome?.() || 0);
        const bonus = clamp(Math.round(income * 0.12), 50, 20000);
        player.applyEffects({ moneyDelta: bonus, stressDelta: 6, happinessDelta: -1, careerSkillDelta: 2 });
      }
    },
    {
      id: "call_family",
      icon: "??",
      titleKey: "action.call_family.title",
      descKey: "action.call_family.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 6;
      },
      apply({ player }) {
        if (!player) return;
        if (Alive.relationships?.ensureExtendedRelationshipsState) {
          Alive.relationships.ensureExtendedRelationshipsState(player);
        }
        player.applyEffects({ happinessDelta: 2, stressDelta: -1, parentsRelationshipDelta: 3, siblingsRelationshipDelta: 2 });
      }
    },
    {
      id: "visit_family",
      icon: "??",
      titleKey: "action.visit_family.title",
      descKey: "action.visit_family.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10 && (player.money || 0) >= 40;
      },
      apply({ player }) {
        if (!player) return;
        const cost = clamp(20 + Math.floor(Math.random() * 80), 20, 120);
        if ((player.money || 0) < cost) return;
        if (Alive.relationships?.ensureExtendedRelationshipsState) {
          Alive.relationships.ensureExtendedRelationshipsState(player);
        }
        player.applyEffects({ moneyDelta: -cost, happinessDelta: 4, stressDelta: -2, parentsRelationshipDelta: 6, siblingsRelationshipDelta: 4 });
      }
    },
    {
      id: "hangout_friends",
      icon: "??",
      titleKey: "action.hangout_friends.title",
      descKey: "action.hangout_friends.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "moneyDelta", value: "-" },
        { type: "socialSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 12 && (player.money || 0) >= 30;
      },
      apply({ player, game }) {
        if (!player) return;
        if (Alive.relationships?.ensureExtendedRelationshipsState) {
          Alive.relationships.ensureExtendedRelationshipsState(player);
        }
        if (!Array.isArray(player.friends) || player.friends.length === 0) {
          player.applyEffects({ addFriendCount: 1, happinessDelta: 2, socialSkillDelta: 1 });
          return;
        }
        const cost = clamp(25 + Math.floor(Math.random() * 120), 25, 160);
        if ((player.money || 0) < cost) return;
        player.applyEffects({ moneyDelta: -cost, happinessDelta: 4, stressDelta: -2, socialSkillDelta: 1, friendsClosenessDelta: 6 });
        const roll = Math.random();
        if (roll < 0.12 && game && Array.isArray(game.eventQueue)) {
          game.eventQueue.push("friend_opportunity");
        }
      }
    },
    {
      id: "adopt_pet",
      icon: "??",
      titleKey: "action.adopt_pet.title",
      descKey: "action.adopt_pet.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 12 && (player.money || 0) >= 200;
      },
      apply({ player }) {
        if (!player) return;
        if (Alive.relationships?.ensureExtendedRelationshipsState) {
          Alive.relationships.ensureExtendedRelationshipsState(player);
        }
        if (Array.isArray(player.pets) && player.pets.length >= 3) return;
        const cost = clamp(120 + Math.floor(Math.random() * 380), 120, 500);
        if ((player.money || 0) < cost) return;
        const typeRoll = Math.random();
        const petType = typeRoll < 0.5 ? "dog" : "cat";
        player.applyEffects({ moneyDelta: -cost, happinessDelta: 4, stressDelta: -1, adoptPetType: petType });
      }
    },
    {
      id: "walk_dog",
      icon: "??",
      titleKey: "action.walk_dog.title",
      descKey: "action.walk_dog.desc",
      previewEffects: [
        { type: "healthDelta", value: "+" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        const pets = Array.isArray(player?.pets) ? player.pets : [];
        return !!player && player.age >= 6 && pets.some((p) => p && p.alive !== false && String(p.type || "").toLowerCase() === "dog");
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ healthDelta: 2, happinessDelta: 2, stressDelta: -2, petBondDelta: 3 });
      }
    },
    {
      id: "play_with_pet",
      icon: "??",
      titleKey: "action.play_with_pet.title",
      descKey: "action.play_with_pet.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        const pets = Array.isArray(player?.pets) ? player.pets : [];
        return !!player && player.age >= 6 && pets.some((p) => p && p.alive !== false);
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ happinessDelta: 2, stressDelta: -2, petBondDelta: 5 });
      }
    },
    {
      id: "study",
      icon: "??",
      titleKey: "action.study.title",
      descKey: "action.study.desc",
      previewEffects: [
        { type: "intelligenceDelta", value: "+" },
        { type: "stressDelta", value: "+" },
        { type: "careerSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 6;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ intelligenceDelta: 3, stressDelta: 2, happinessDelta: -1, careerSkillDelta: 1 });
      }
    },
    {
      id: "train",
      icon: "???",
      titleKey: "action.train.title",
      descKey: "action.train.desc",
      previewEffects: [
        { type: "healthDelta", value: "+" },
        { type: "stressDelta", value: "-" },
        { type: "sportsSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ healthDelta: 3, stressDelta: -2, happinessDelta: 1, sportsSkillDelta: 2 });
      }
    },
    {
      id: "socialize",
      icon: "??",
      titleKey: "action.socialize.title",
      descKey: "action.socialize.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "stressDelta", value: "-" },
        { type: "socialSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 6;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ happinessDelta: 3, stressDelta: -3, socialSkillDelta: 2 });
        if (player.partner) {
          player.applyEffects({ relationshipScoreDelta: 4 });
        }
      }
    },
    {
      id: "find_partner",
      icon: "??",
      titleKey: "action.find_partner.title",
      descKey: "action.find_partner.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "socialSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && !player.partner;
      },
      apply({ player }) {
        if (!player || player.partner) return;
        player.applyEffects({ relationshipStart: true, happinessDelta: 2, stressDelta: -1, socialSkillDelta: 1 });
      }
    },
    {
      id: "post_social",
      icon: "??",
      titleKey: "action.post_social.title",
      descKey: "action.post_social.desc",
      previewEffects: [
        { type: "followersDelta", value: "+" },
        { type: "happinessDelta", value: "+" },
        { type: "socialSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 12;
      },
      apply({ player }) {
        if (!player) return;
        const base = player.age < 18 ? 50 : 30;
        const gain = base + Math.floor(Math.random() * base);
        player.followers = Math.max(0, Math.floor(Number(player.followers) || 0));
        player.followers += gain;
        player.applyEffects({ happinessDelta: 1, stressDelta: 1, socialSkillDelta: 1 });
      }
    },
    {
      id: "invest_stocks",
      icon: "??",
      titleKey: "action.invest_stocks.title",
      descKey: "action.invest_stocks.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "investingSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 200;
      },
      apply({ player }) {
        if (!player) return;
        const amount = clamp(Math.round((player.money || 0) * 0.15), 200, 20000);
        if (player.money < amount) return;
        player.applyEffects({ investType: "stocks", investAmount: amount, investingSkillDelta: 1 });
        player.applyEffects({ stressDelta: 1 });
      }
    },
    {
      id: "practice_hobby",
      icon: "??",
      titleKey: "action.practice_hobby.title",
      descKey: "action.practice_hobby.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "+" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10;
      },
      apply({ player }) {
        if (!player) return;
        const current = typeof player.mainHobbyId === "string" && player.mainHobbyId.trim()
          ? player.mainHobbyId.trim()
          : "coding";
        player.applyEffects({
          mainHobbyIdSet: current,
          hobbySkillId: current,
          hobbySkillDelta: 3,
          happinessDelta: 1,
          stressDelta: -1
        });
      }
    },
    {
      id: "buy_car_basic",
      icon: "",
      titleKey: "action.buy_car.title",
      descKey: "action.buy_car.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && !player.car && (player.money || 0) >= 4000;
      },
      apply({ player }) {
        if (!player || player.car) return;
        player.applyEffects({ moneyDelta: -4000, happinessDelta: 2, carChange: "cheap" });
      }
    },
    {
      id: "upgrade_housing",
      icon: "",
      titleKey: "action.upgrade_housing.title",
      descKey: "action.upgrade_housing.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 30000;
      },
      apply({ player }) {
        if (!player) return;
        const current = player.housing || "apartment";
        if (current === "mansion") return;
        const next = current === "apartment" ? "condo" : current === "condo" ? "house" : "mansion";
        const cost = next === "condo" ? 20000 : next === "house" ? 80000 : 250000;
        if ((player.money || 0) < cost) return;
        player.applyEffects({ moneyDelta: -cost, happinessDelta: 5, housingChange: next, stressDelta: 2 });
      }
    },
    {
      id: "browse_houses",
      icon: "",
      titleKey: "action.browse_houses.title",
      descKey: "action.browse_houses.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      uiType: "browse_houses",
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const options = city?.availableHousings ? Object.values(city.availableHousings) : [];
        return options.some((o) => (player.money || 0) >= (o?.price || 0));
      },
      apply() { }
    },
    {
      id: "browse_cars",
      icon: "??",
      titleKey: "action.browse_cars.title",
      descKey: "action.browse_cars.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      uiType: "browse_cars",
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const options = city?.availableCars ? Object.values(city.availableCars) : [];
        return options.some((o) => (player.money || 0) >= (o?.price || 0));
      },
      apply() { }
    },

    {
      id: "start_blog",
      icon: "??",
      titleKey: "action.start_blog.title",
      descKey: "action.start_blog.desc",
      previewEffects: [
        { type: "followersDelta", value: "+" },
        { type: "happinessDelta", value: "+" },
        { type: "businessSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        const followers = Math.max(0, Math.floor(Number(player?.followers) || 0));
        return !!player && player.age >= 13 && followers < 10;
      },
      apply({ player }) {
        if (!player) return;
        const followers = Math.max(0, Math.floor(Number(player.followers) || 0));
        player.followers = Math.max(followers, 10);
        player.applyEffects({ happinessDelta: 1, stressDelta: 1, businessSkillDelta: 1 });
      }
    },

    {
      id: "post_content",
      icon: "??",
      titleKey: "action.post_content.title",
      descKey: "action.post_content.desc",
      previewEffects: [
        { type: "followersDelta", value: "+" },
        { type: "moneyDelta", value: "+" },
        { type: "businessSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        const followers = Math.max(0, Math.floor(Number(player?.followers) || 0));
        return !!player && player.age >= 13 && followers >= 10;
      },
      apply({ player }) {
        if (!player) return;
        const followers = Math.max(0, Math.floor(Number(player.followers) || 0));
        const roll = Math.random();
        const gainFollowers = roll < 0.7 ? 15 + Math.floor(Math.random() * 80) : 0;
        const gainMoney = roll < 0.25 ? 40 + Math.floor(Math.random() * 260) : 0;
        player.followers = followers + gainFollowers;
        player.applyEffects({ moneyDelta: gainMoney, happinessDelta: 1, stressDelta: 2, businessSkillDelta: 1 });
      }
    },

    {
      id: "weekend_trip",
      icon: "??",
      titleKey: "action.weekend_trip.title",
      descKey: "action.weekend_trip.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 300;
      },
      apply({ player }) {
        if (!player) return;
        const cost = clamp(250 + Math.floor(Math.random() * 950), 250, 1200);
        if ((player.money || 0) < cost) return;
        player.applyEffects({ moneyDelta: -cost, happinessDelta: 3, stressDelta: -2, intelligenceDelta: 1 });
      }
    },

    {
      id: "serious_study",
      icon: "??",
      titleKey: "action.serious_study.title",
      descKey: "action.serious_study.desc",
      previewEffects: [
        { type: "intelligenceDelta", value: "++" },
        { type: "moneyDelta", value: "-" },
        { type: "stressDelta", value: "+" },
        { type: "careerSkillDelta", value: "++" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 12 && player.age <= 25 && (player.money || 0) >= 150;
      },
      apply({ player }) {
        if (!player) return;
        const cost = 150;
        if ((player.money || 0) < cost) return;
        player.applyEffects({ moneyDelta: -cost, intelligenceDelta: 6, stressDelta: 4, happinessDelta: -2, careerSkillDelta: 3 });
      }
    },

    {
      id: "date_search",
      icon: "??",
      titleKey: "action.date_search.title",
      descKey: "action.date_search.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "socialSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && !player.partner;
      },
      apply({ player }) {
        if (!player || player.partner) return;
        const socialSkill = clamp(player.socialSkill || 0, 0, 100);
        const roll = Math.random();
        const chance = clamp(0.35 + socialSkill / 250, 0.35, 0.75);
        if (roll < chance) {
          player.applyEffects({ relationshipStart: true, happinessDelta: 2, stressDelta: 1, socialSkillDelta: 2 });
        } else {
          player.applyEffects({ happinessDelta: 1, stressDelta: 1, socialSkillDelta: 1 });
        }
      }
    },

    {
      id: "propose_marriage",
      icon: "??",
      titleKey: "action.propose_marriage.title",
      descKey: "action.propose_marriage.desc",
      previewEffects: [
        { type: "happinessDelta", value: "++" },
        { type: "relationshipScoreDelta", value: "+" }
      ],
      isAvailable(player) {
        return (
          !!player &&
          player.age >= 18 &&
          player.partner &&
          player.marriageStatus === "dating" &&
          (player.partner.relationshipScore || 0) >= 65
        );
      },
      apply({ player }) {
        if (!player || !player.partner) return;
        if (player.marriageStatus !== "dating") return;
        if ((player.partner.relationshipScore || 0) < 65) return;
        player.applyEffects({ marriageStart: true, happinessDelta: 4, relationshipScoreDelta: 6, stressDelta: -2 });
      }
    },

    {
      id: "try_for_child",
      icon: "??",
      titleKey: "action.try_for_child.title",
      descKey: "action.try_for_child.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "stressDelta", value: "+" }
      ],
      isAvailable(player) {
        return (
          !!player &&
          player.age >= 18 &&
          player.partner &&
          player.marriageStatus === "married" &&
          (player.partner.relationshipScore || 0) >= 55
        );
      },
      apply({ player }) {
        if (!player || !player.partner) return;
        if (player.marriageStatus !== "married") return;
        const roll = Math.random();
        if (roll < 0.35) {
          player.applyEffects({ triggerChild: true, happinessDelta: 3, stressDelta: 2 });
        } else {
          player.applyEffects({ happinessDelta: 1, stressDelta: 1, relationshipScoreDelta: 2 });
        }
      }
    },

    {
      id: "romantic_date",
      icon: "??",
      titleKey: "action.romantic_date.title",
      descKey: "action.romantic_date.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" },
        { type: "relationshipScoreDelta", value: "+" }
      ],
      isAvailable(player) {
        return (
          !!player &&
          player.age >= 18 &&
          player.partner &&
          (player.marriageStatus === "dating" || player.marriageStatus === "married") &&
          (player.money || 0) >= 80
        );
      },
      apply({ player }) {
        if (!player || !player.partner) return;
        if (player.age < 18) return;
        if (player.marriageStatus !== "dating" && player.marriageStatus !== "married") return;

        const cost = clamp(80 + Math.floor(Math.random() * 220), 80, 300);
        if ((player.money || 0) < cost) return;
        player.applyEffects({ moneyDelta: -cost, happinessDelta: 3, stressDelta: -2, relationshipScoreDelta: 8 });
      }
    },

    {
      id: "marriage_counseling",
      icon: "?????",
      titleKey: "action.marriage_counseling.title",
      descKey: "action.marriage_counseling.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "relationshipScoreDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        return (
          !!player &&
          player.age >= 18 &&
          player.partner &&
          player.marriageStatus === "married" &&
          (player.partner.relationshipScore || 0) <= 60 &&
          (player.money || 0) >= 200
        );
      },
      apply({ player }) {
        if (!player || !player.partner) return;
        if (player.marriageStatus !== "married") return;
        const cost = 200;
        if ((player.money || 0) < cost) return;
        player.applyEffects({ moneyDelta: -cost, relationshipScoreDelta: 12, stressDelta: -3, happinessDelta: 1 });
      }
    },

    {
      id: "buy_house_apartment",
      icon: "??",
      titleKey: "action.buy_house.apartment.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.apartment?.price || 0;
        return (player.money || 0) >= price && (player.housing || "apartment") !== "apartment";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.apartment?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, housingChange: "apartment", happinessDelta: 2, stressDelta: 1 });
      }
    },

    {
      id: "buy_house_condo",
      icon: "??",
      titleKey: "action.buy_house.condo.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.condo?.price || 0;
        return (player.money || 0) >= price && (player.housing || "apartment") !== "condo";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.condo?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, housingChange: "condo", happinessDelta: 3, stressDelta: 1 });
      }
    },

    {
      id: "buy_house_house",
      icon: "??",
      titleKey: "action.buy_house.house.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.house?.price || 0;
        return (player.money || 0) >= price && (player.housing || "apartment") !== "house";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.house?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, housingChange: "house", happinessDelta: 4, stressDelta: 2 });
      }
    },

    {
      id: "buy_house_mansion",
      icon: "??",
      titleKey: "action.buy_house.mansion.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.mansion?.price || 0;
        return (player.money || 0) >= price && (player.housing || "apartment") !== "mansion";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableHousings?.mansion?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, housingChange: "mansion", happinessDelta: 6, stressDelta: 2 });
      }
    },

    {
      id: "buy_car_cheap",
      icon: "??",
      titleKey: "action.buy_car.cheap.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.cheap?.price || 0;
        return (player.money || 0) >= price && (player.car || "") !== "cheap";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.cheap?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, carChange: "cheap", happinessDelta: 2 });
      }
    },

    {
      id: "buy_car_mid",
      icon: "??",
      titleKey: "action.buy_car.mid.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.mid?.price || 0;
        return (player.money || 0) >= price && (player.car || "") !== "mid";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.mid?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, carChange: "mid", happinessDelta: 3 });
      }
    },

    {
      id: "buy_car_luxury",
      icon: "??",
      titleKey: "action.buy_car.luxury.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.luxury?.price || 0;
        return (player.money || 0) >= price && (player.car || "") !== "luxury";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.luxury?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, carChange: "luxury", happinessDelta: 4, stressDelta: 1 });
      }
    },

    {
      id: "buy_car_sports",
      icon: "???",
      titleKey: "action.buy_car.sports.title",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "+" },
        { type: "stressDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 18) return false;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.sports?.price || 0;
        return (player.money || 0) >= price && (player.car || "") !== "sports";
      },
      apply({ player }) {
        if (!player) return;
        const cityId = player.cityId || player.city;
        const city = Alive.cities?.getCityById ? Alive.cities.getCityById(cityId) : null;
        const price = city?.availableCars?.sports?.price || 0;
        if ((player.money || 0) < price) return;
        player.applyEffects({ moneyDelta: -price, carChange: "sports", happinessDelta: 5, stressDelta: 2 });
      }
    },

    // =========================================================================
    // FAMILY ACTIONS
    // =========================================================================

    {
      id: "call_family",
      icon: "??",
      titleKey: "action.call_family.title",
      descKey: "action.call_family.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "relationshipScoreDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 10) return false;
        Alive.relationships?.ensureExtendedRelationshipsState?.(player);
        const mother = player.parents?.mother;
        const father = player.parents?.father;
        return (mother?.alive !== false) || (father?.alive !== false);
      },
      apply({ player }) {
        if (!player) return;
        const result = Alive.relationships?.visitFamily?.(player);
        if (result?.success && result.effects) {
          player.applyEffects({
            happinessDelta: Math.floor((result.effects.happinessDelta || 0) / 2),
            stressDelta: -1
          });
        }
      }
    },

    {
      id: "visit_family",
      icon: "??",
      titleKey: "action.visit_family.title",
      descKey: "action.visit_family.desc",
      previewEffects: [
        { type: "happinessDelta", value: "++" },
        { type: "stressDelta", value: "-" },
        { type: "relationshipScoreDelta", value: "++" }
      ],
      isAvailable(player) {
        if (!player || player.age < 14) return false;
        Alive.relationships?.ensureExtendedRelationshipsState?.(player);
        const mother = player.parents?.mother;
        const father = player.parents?.father;
        const hasSiblings = (player.siblings || []).some(s => s.alive !== false);
        return (mother?.alive !== false) || (father?.alive !== false) || hasSiblings;
      },
      apply({ player }) {
        if (!player) return;
        const result = Alive.relationships?.visitFamily?.(player);
        if (result?.success && result.effects) {
          player.applyEffects(result.effects);
        }
      }
    },

    // =========================================================================
    // FRIEND ACTIONS
    // =========================================================================

    {
      id: "hangout_friends",
      icon: "??",
      titleKey: "action.hangout_friends.title",
      descKey: "action.hangout_friends.desc",
      previewEffects: [
        { type: "happinessDelta", value: "++" },
        { type: "stressDelta", value: "-" },
        { type: "socialSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 10) return false;
        Alive.relationships?.ensureExtendedRelationshipsState?.(player);
        const aliveFriends = (player.friends || []).filter(f => f.alive !== false);
        return aliveFriends.length > 0;
      },
      apply({ player, game }) {
        if (!player) return;
        const result = Alive.relationships?.hangOutWithFriends?.(player);
        if (result?.success && result.effects) {
          player.applyEffects(result.effects);
          // Queue special event if triggered
          if (result.specialEvent && game?.eventQueue) {
            game.eventQueue.push(result.specialEvent);
          }
        }
      }
    },

    {
      id: "make_friends",
      icon: "??",
      titleKey: "action.make_friends.title",
      descKey: "action.make_friends.desc",
      previewEffects: [
        { type: "socialSkillDelta", value: "+" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        if (!player || player.age < 10) return false;
        Alive.relationships?.ensureExtendedRelationshipsState?.(player);
        return (player.friends || []).length < 5;
      },
      apply({ player }) {
        if (!player) return;
        const result = Alive.relationships?.makeFriend?.(player);
        if (result?.success && result.effects) {
          player.applyEffects(result.effects);
        } else {
          // Failed to make friend, small social skill gain
          player.applyEffects({ socialSkillDelta: 1 });
        }
      }
    },

    // =========================================================================
    // PET ACTIONS
    // =========================================================================

    {
      id: "adopt_dog",
      icon: "??",
      titleKey: "action.adopt_dog.title",
      descKey: "action.adopt_dog.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "++" }
      ],
      isAvailable(player) {
        if (!player || player.age < 16) return false;
        return (player.money || 0) >= 300;
      },
      apply({ player }) {
        if (!player) return;
        const result = Alive.relationships?.adoptNewPet?.(player, "dog");
        if (result?.success && result.effects) {
          player.applyEffects(result.effects);
        }
      }
    },

    {
      id: "adopt_cat",
      icon: "??",
      titleKey: "action.adopt_cat.title",
      descKey: "action.adopt_cat.desc",
      previewEffects: [
        { type: "moneyDelta", value: "-" },
        { type: "happinessDelta", value: "++" }
      ],
      isAvailable(player) {
        if (!player || player.age < 16) return false;
        return (player.money || 0) >= 150;
      },
      apply({ player }) {
        if (!player) return;
        const result = Alive.relationships?.adoptNewPet?.(player, "cat");
        if (result?.success && result.effects) {
          player.applyEffects(result.effects);
        }
      }
    },

    {
      id: "walk_dog",
      icon: "??",
      titleKey: "action.walk_dog.title",
      descKey: "action.walk_dog.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "healthDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        if (!player) return false;
        Alive.relationships?.ensureExtendedRelationshipsState?.(player);
        return (player.pets || []).some(p => p.type === "dog" && p.alive !== false);
      },
      apply({ player }) {
        if (!player) return;
        const result = Alive.relationships?.walkDog?.(player);
        if (result?.success && result.effects) {
          player.applyEffects(result.effects);
        }
      }
    },

    {
      id: "play_with_pet",
      icon: "??",
      titleKey: "action.play_with_pet.title",
      descKey: "action.play_with_pet.desc",
      previewEffects: [
        { type: "happinessDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        if (!player) return false;
        Alive.relationships?.ensureExtendedRelationshipsState?.(player);
        return (player.pets || []).some(p => p.alive !== false);
      },
      apply({ player }) {
        if (!player) return;
        const result = Alive.relationships?.playWithPet?.(player);
        if (result?.success && result.effects) {
          player.applyEffects(result.effects);
        }
      }
    },

    // =========================================================================
    // SKILL-BUILDING ACTIONS
    // =========================================================================

    // SPORTS SKILL
    {
      id: "gym_workout",
      icon: "??",
      titleKey: "action.gym_workout.title",
      descKey: "action.gym_workout.desc",
      previewEffects: [
        { type: "sportsSkillDelta", value: "++" },
        { type: "healthDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 14;
      },
      apply({ player }) {
        if (!player) return;
        const hasGymSub = player.subscriptions?.sub_gym_basic || player.subscriptions?.sub_gym_premium || player.subscriptions?.sub_gym_elite;
        const skillGain = hasGymSub ? 4 : 2;
        const healthGain = hasGymSub ? 3 : 2;
        player.applyEffects({ sportsSkillDelta: skillGain, healthDelta: healthGain, stressDelta: -3, happinessDelta: 1 });
      }
    },
    {
      id: "join_sports_team",
      icon: "?",
      titleKey: "action.join_sports_team.title",
      descKey: "action.join_sports_team.desc",
      previewEffects: [
        { type: "sportsSkillDelta", value: "++" },
        { type: "socialSkillDelta", value: "+" },
        { type: "healthDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10 && player.age <= 45;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ sportsSkillDelta: 3, socialSkillDelta: 2, healthDelta: 2, happinessDelta: 2, stressDelta: 1 });
      }
    },
    {
      id: "run_marathon_training",
      icon: "??",
      titleKey: "action.marathon_training.title",
      descKey: "action.marathon_training.desc",
      previewEffects: [
        { type: "sportsSkillDelta", value: "+++" },
        { type: "healthDelta", value: "++" },
        { type: "stressDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16 && (player.sportsSkill || 0) >= 30;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ sportsSkillDelta: 5, healthDelta: 4, stressDelta: 3, happinessDelta: 2 });
      }
    },

    // BUSINESS SKILL
    {
      id: "read_business_books",
      icon: "??",
      titleKey: "action.read_business_books.title",
      descKey: "action.read_business_books.desc",
      previewEffects: [
        { type: "businessSkillDelta", value: "++" },
        { type: "intelligenceDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 14;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ businessSkillDelta: 3, intelligenceDelta: 1, happinessDelta: 1 });
      }
    },
    {
      id: "attend_business_seminar",
      icon: "??",
      titleKey: "action.business_seminar.title",
      descKey: "action.business_seminar.desc",
      previewEffects: [
        { type: "businessSkillDelta", value: "+++" },
        { type: "socialSkillDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 500;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ businessSkillDelta: 5, socialSkillDelta: 2, moneyDelta: -500, intelligenceDelta: 1 });
      }
    },
    {
      id: "network_at_events",
      icon: "??",
      titleKey: "action.network_events.title",
      descKey: "action.network_events.desc",
      previewEffects: [
        { type: "businessSkillDelta", value: "+" },
        { type: "socialSkillDelta", value: "++" },
        { type: "careerSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 100;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ businessSkillDelta: 2, socialSkillDelta: 3, careerSkillDelta: 2, moneyDelta: -100, happinessDelta: 1 });
      }
    },
    {
      id: "start_side_project",
      icon: "??",
      titleKey: "action.side_project.title",
      descKey: "action.side_project.desc",
      previewEffects: [
        { type: "businessSkillDelta", value: "++" },
        { type: "stressDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16;
      },
      apply({ player }) {
        if (!player) return;
        const moneyGain = Math.random() < 0.3 ? Math.floor(Math.random() * 500) + 100 : 0;
        player.applyEffects({ businessSkillDelta: 3, stressDelta: 4, moneyDelta: moneyGain, intelligenceDelta: 1 });
      }
    },

    // INVESTING SKILL
    {
      id: "study_investing",
      icon: "??",
      titleKey: "action.study_investing.title",
      descKey: "action.study_investing.desc",
      previewEffects: [
        { type: "investingSkillDelta", value: "++" },
        { type: "intelligenceDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ investingSkillDelta: 3, intelligenceDelta: 1 });
      }
    },
    {
      id: "follow_markets",
      icon: "??",
      titleKey: "action.follow_markets.title",
      descKey: "action.follow_markets.desc",
      previewEffects: [
        { type: "investingSkillDelta", value: "+" },
        { type: "stressDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ investingSkillDelta: 2, stressDelta: 2, intelligenceDelta: 1 });
      }
    },
    {
      id: "paper_trading",
      icon: "??",
      titleKey: "action.paper_trading.title",
      descKey: "action.paper_trading.desc",
      previewEffects: [
        { type: "investingSkillDelta", value: "++" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 14;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ investingSkillDelta: 3, intelligenceDelta: 1 });
      }
    },
    {
      id: "investment_course",
      icon: "??",
      titleKey: "action.investment_course.title",
      descKey: "action.investment_course.desc",
      previewEffects: [
        { type: "investingSkillDelta", value: "+++" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 1000;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ investingSkillDelta: 6, moneyDelta: -1000, intelligenceDelta: 2 });
      }
    },

    // CAREER SKILL
    {
      id: "professional_development",
      icon: "??",
      titleKey: "action.professional_dev.title",
      descKey: "action.professional_dev.desc",
      previewEffects: [
        { type: "careerSkillDelta", value: "++" },
        { type: "intelligenceDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ careerSkillDelta: 3, intelligenceDelta: 1, stressDelta: 1 });
      }
    },
    {
      id: "get_certification",
      icon: "??",
      titleKey: "action.get_certification.title",
      descKey: "action.get_certification.desc",
      previewEffects: [
        { type: "careerSkillDelta", value: "+++" },
        { type: "moneyDelta", value: "-" },
        { type: "stressDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 800;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ careerSkillDelta: 5, moneyDelta: -800, stressDelta: 4, intelligenceDelta: 2 });
      }
    },
    {
      id: "mentor_junior",
      icon: "?????",
      titleKey: "action.mentor_junior.title",
      descKey: "action.mentor_junior.desc",
      previewEffects: [
        { type: "careerSkillDelta", value: "+" },
        { type: "socialSkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 25 && (player.careerSkill || 0) >= 40;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ careerSkillDelta: 2, socialSkillDelta: 3, happinessDelta: 3 });
      }
    },
    {
      id: "work_overtime",
      icon: "??",
      titleKey: "action.work_overtime.title",
      descKey: "action.work_overtime.desc",
      previewEffects: [
        { type: "careerSkillDelta", value: "++" },
        { type: "moneyDelta", value: "+" },
        { type: "stressDelta", value: "++" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16 && player.job !== "unemployed";
      },
      apply({ player }) {
        if (!player) return;
        const income = Math.max(0, player.annualIncome || player.getJobIncome?.() || 0);
        const bonus = clamp(Math.round(income * 0.08), 100, 10000);
        player.applyEffects({ careerSkillDelta: 3, moneyDelta: bonus, stressDelta: 6, healthDelta: -1, happinessDelta: -2 });
      }
    },

    // SOCIAL SKILL
    {
      id: "join_club",
      icon: "??",
      titleKey: "action.join_club.title",
      descKey: "action.join_club.desc",
      previewEffects: [
        { type: "socialSkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 12;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ socialSkillDelta: 3, happinessDelta: 2, stressDelta: -1 });
      }
    },
    {
      id: "public_speaking",
      icon: "???",
      titleKey: "action.public_speaking.title",
      descKey: "action.public_speaking.desc",
      previewEffects: [
        { type: "socialSkillDelta", value: "+++" },
        { type: "careerSkillDelta", value: "+" },
        { type: "stressDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ socialSkillDelta: 4, careerSkillDelta: 2, stressDelta: 4, happinessDelta: 1 });
      }
    },
    {
      id: "volunteer_work",
      icon: "??",
      titleKey: "action.volunteer_work.title",
      descKey: "action.volunteer_work.desc",
      previewEffects: [
        { type: "socialSkillDelta", value: "++" },
        { type: "happinessDelta", value: "++" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 14;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ socialSkillDelta: 3, happinessDelta: 4, stressDelta: -2 });
      }
    },
    {
      id: "host_party",
      icon: "??",
      titleKey: "action.host_party.title",
      descKey: "action.host_party.desc",
      previewEffects: [
        { type: "socialSkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 300;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ socialSkillDelta: 4, happinessDelta: 3, moneyDelta: -300, stressDelta: 2 });
      }
    },

    // HOBBY SKILLS
    {
      id: "learn_music",
      icon: "??",
      titleKey: "action.learn_music.title",
      descKey: "action.learn_music.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 8;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ mainHobbyIdSet: "music", hobbySkillId: "music", hobbySkillDelta: 4, happinessDelta: 2, stressDelta: -2 });
      }
    },
    {
      id: "learn_art",
      icon: "??",
      titleKey: "action.learn_art.title",
      descKey: "action.learn_art.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 6;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ mainHobbyIdSet: "art", hobbySkillId: "art", hobbySkillDelta: 4, happinessDelta: 2, stressDelta: -2 });
      }
    },
    {
      id: "learn_coding",
      icon: "??",
      titleKey: "action.learn_coding.title",
      descKey: "action.learn_coding.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "++" },
        { type: "intelligenceDelta", value: "+" },
        { type: "careerSkillDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ mainHobbyIdSet: "coding", hobbySkillId: "coding", hobbySkillDelta: 4, intelligenceDelta: 2, careerSkillDelta: 1 });
      }
    },
    {
      id: "learn_cooking",
      icon: "?????",
      titleKey: "action.learn_cooking.title",
      descKey: "action.learn_cooking.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" },
        { type: "healthDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ mainHobbyIdSet: "cooking", hobbySkillId: "cooking", hobbySkillDelta: 4, happinessDelta: 2, healthDelta: 1 });
      }
    },
    {
      id: "learn_gaming",
      icon: "??",
      titleKey: "action.learn_gaming.title",
      descKey: "action.learn_gaming.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 6;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ mainHobbyIdSet: "gaming", hobbySkillId: "gaming", hobbySkillDelta: 4, happinessDelta: 3, stressDelta: -3 });
      }
    },
    {
      id: "learn_photography",
      icon: "??",
      titleKey: "action.learn_photography.title",
      descKey: "action.learn_photography.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "++" },
        { type: "happinessDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 12;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ mainHobbyIdSet: "photography", hobbySkillId: "photography", hobbySkillDelta: 4, happinessDelta: 2, socialSkillDelta: 1 });
      }
    },
    {
      id: "learn_writing",
      icon: "??",
      titleKey: "action.learn_writing.title",
      descKey: "action.learn_writing.desc",
      previewEffects: [
        { type: "hobbySkillDelta", value: "++" },
        { type: "intelligenceDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({ mainHobbyIdSet: "writing", hobbySkillId: "writing", hobbySkillDelta: 4, intelligenceDelta: 2, happinessDelta: 1 });
      }
    },

    // ============================================================================
    // NEEDS-FOCUSED ACTIONS
    // ============================================================================
    {
      id: "take_vacation",
      icon: "???",
      titleKey: "action.take_vacation.title",
      descKey: "action.take_vacation.desc",
      previewEffects: [
        { type: "energyDelta", value: "+" },
        { type: "funDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 500;
      },
      apply({ player }) {
        if (!player) return;
        const cost = clamp(500 + Math.floor(Math.random() * 1500), 500, 2000);
        if ((player.money || 0) < cost) return;
        player.applyEffects({
          moneyDelta: -cost,
          happinessDelta: 8,
          stressDelta: -15,
          energyDelta: 30,
          funDelta: 25,
          comfortDelta: 10
        });
      }
    },
    {
      id: "see_therapist",
      icon: "??",
      titleKey: "action.see_therapist.title",
      descKey: "action.see_therapist.desc",
      previewEffects: [
        { type: "stressDelta", value: "-" },
        { type: "socialDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16 && (player.money || 0) >= 150;
      },
      apply({ player }) {
        if (!player) return;
        const cost = 200;
        if ((player.money || 0) < cost) return;
        player.applyEffects({
          moneyDelta: -cost,
          stressDelta: -12,
          happinessDelta: 3,
          socialDelta: 10,
          energyDelta: 5
        });
      }
    },
    {
      id: "take_nap",
      icon: "??",
      titleKey: "action.take_nap.title",
      descKey: "action.take_nap.desc",
      previewEffects: [
        { type: "energyDelta", value: "+" },
        { type: "stressDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 5;
      },
      apply({ player }) {
        if (!player) return;
        player.applyEffects({
          energyDelta: 20,
          stressDelta: -5,
          healthDelta: 1
        });
      }
    },
    {
      id: "go_shopping",
      icon: "???",
      titleKey: "action.go_shopping.title",
      descKey: "action.go_shopping.desc",
      previewEffects: [
        { type: "comfortDelta", value: "+" },
        { type: "funDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 14 && (player.money || 0) >= 50;
      },
      apply({ player }) {
        if (!player) return;
        const cost = clamp(50 + Math.floor(Math.random() * 200), 50, 250);
        if ((player.money || 0) < cost) return;
        player.applyEffects({
          moneyDelta: -cost,
          happinessDelta: 3,
          comfortDelta: 15,
          funDelta: 10,
          socialDelta: 5
        });
      }
    },
    {
      id: "stay_home_relax",
      icon: "??",
      titleKey: "action.stay_home_relax.title",
      descKey: "action.stay_home_relax.desc",
      previewEffects: [
        { type: "energyDelta", value: "+" },
        { type: "comfortDelta", value: "+" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 10;
      },
      apply({ player }) {
        if (!player) return;
        // Bonus if has nice housing
        const housingBonus = player.housing === "mansion" ? 10 : player.housing === "house" ? 5 : 0;
        player.applyEffects({
          energyDelta: 15 + housingBonus,
          comfortDelta: 20 + housingBonus,
          stressDelta: -8,
          funDelta: 5
        });
      }
    },
    {
      id: "throw_party",
      icon: "??",
      titleKey: "action.throw_party.title",
      descKey: "action.throw_party.desc",
      previewEffects: [
        { type: "socialDelta", value: "+" },
        { type: "funDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 16 && (player.money || 0) >= 100;
      },
      apply({ player }) {
        if (!player) return;
        const cost = clamp(100 + Math.floor(Math.random() * 400), 100, 500);
        if ((player.money || 0) < cost) return;
        player.applyEffects({
          moneyDelta: -cost,
          happinessDelta: 5,
          socialDelta: 25,
          funDelta: 20,
          energyDelta: -10
        });
      }
    },
    {
      id: "spa_day",
      icon: "??",
      titleKey: "action.spa_day.title",
      descKey: "action.spa_day.desc",
      previewEffects: [
        { type: "comfortDelta", value: "+" },
        { type: "energyDelta", value: "+" },
        { type: "moneyDelta", value: "-" }
      ],
      isAvailable(player) {
        return !!player && player.age >= 18 && (player.money || 0) >= 80;
      },
      apply({ player }) {
        if (!player) return;
        const cost = 150;
        if ((player.money || 0) < cost) return;
        player.applyEffects({
          moneyDelta: -cost,
          healthDelta: 3,
          happinessDelta: 4,
          stressDelta: -10,
          comfortDelta: 20,
          energyDelta: 15
        });
      }
    }
  ];

  function getActionById(actionId) {
    return actions.find((a) => a.id === actionId) || null;
  }

  function getAvailableActions(player) {
    return actions.filter((a) => {
      try {
        return !a.isAvailable || a.isAvailable(player);
      } catch (e) {
        return false;
      }
    });
  }

  function buildEffectBadges(action) {
    const previews = Array.isArray(action.previewEffects) ? action.previewEffects : [];
    return previews
      .map((p) => {
        const icon = EFFECT_ICONS[p.type] || "";
        return { icon, type: p.type, value: p.value };
      })
      .filter((x) => x.icon);
  }

  function applyAction(actionId, context) {
    const action = getActionById(actionId);
    if (!action || typeof action.apply !== "function") return false;
    action.apply(context || {});
    return true;
  }

  Alive.actions = {
    actions,
    getActionMaxCount,
    getActionById,
    getAvailableActions,
    buildEffectBadges,
    applyAction
  };
})(window);
