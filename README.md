# בטיחות בדרכים – קורקינט חשמלי
# Sécurité routière – Trottinette électrique

---

## עברית

### תיאור
אפליקציה חינוכית לבטיחות בדרכים לרוכבי קורקינט חשמלי בישראל, מיועדת לבני נוער מגיל 16 (ובפרט לתושבי הרצליה).
האפליקציה מסייעת ללמוד את חוקי התעבורה הישראליים, תקנות הקורקינט החשמלי ומודעות לסכנות בדרכים.

### מצבי שימוש
- **מצב אימון** — עיון חופשי בכל השאלות, עם הצגת תשובות והסברים
- **מצב בחינה** — 20 שאלות אקראיות, טיימר 30 שניות לשאלה, ציון עובר: 80%

### נושאי הבחינה (120 שאלות)
1. חוקי קורקינט חשמלי בישראל (30 שאלות)
2. קוד תעבורה כללי (25 שאלות)
3. מודעות דרך וזיהוי סכנות (25 שאלות)
4. עירוני והרצליה (20 שאלות)
5. שאלות נוספות (20 שאלות)

### טכנולוגיה
- HTML + CSS + JavaScript 순 טהור (ללא framework)
- PWA עם Service Worker לשימוש ללא אינטרנט
- עיצוב Mobile-First, RTL מלא
- גופן: Heebo מ-Google Fonts

### פריסה
האפליקציה מתארחת ב-GitHub Pages ומופעלת ישירות מהדפדפן.

---

## Français

### Description
Application éducative pour la sécurité routière des conducteurs de trottinettes électriques en Israël, destinée aux adolescents dès 16 ans (en particulier ceux d'Herzliya).
L'application aide à apprendre le code de la route israélien, les réglementations sur les trottinettes électriques et la conscience des dangers de la route.

### Modes d'utilisation
- **Mode entraînement** — parcourir librement toutes les questions avec les réponses et explications
- **Mode examen** — 20 questions aléatoires, minuteur de 30 secondes par question, score de passage : 80%

### Thèmes couverts (120 questions)
1. Lois sur les trottinettes électriques en Israël
2. Code de la route général
3. Conscience routière et identification des dangers
4. Milieu urbain – Herzliya

### Technologie
- HTML + CSS + JavaScript pur (sans framework)
- PWA avec Service Worker pour une utilisation hors ligne
- Design Mobile-First, support RTL complet
- Police : Heebo depuis Google Fonts

### Déploiement
L'application est hébergée sur GitHub Pages et fonctionne directement dans le navigateur.

---

## Deployment / פריסה

### GitHub Pages Setup
1. Push all files to the `main` branch
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch → main → / (root)**
4. Site will be live at: `https://[username].github.io/scooter-road-safety-il`

### Local Development
```bash
# No build step required — open index.html directly
# Or use a local server:
npx serve .
# or
python -m http.server 8080
```

---

## License

MIT © 2025 — See [LICENSE](LICENSE)
