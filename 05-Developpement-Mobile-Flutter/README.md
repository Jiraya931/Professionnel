# 📱 Développement Mobile Multi-Plateforme (Flutter & Dart)

> **Projet de Développement d'Application — Master 1 RESI**  
> **Auteur** : Ababacar Ousmane Niang  
> **Technologies** : Flutter SDK, Dart, Provider (State Management), Material Design 3

---

## 🎯 Présentation du Projet

Ce projet illustre la conception et le développement d'une application mobile moderne, performante et réactive développée sous le framework **Flutter** de Google.

### Fonctionnalités Clés Implémentées :
- **Gestion d'état réactive (State Management)** : Utilisation de la bibliothèque `provider` pour propager l'état applicatif à travers l'arbre de widgets.
- **Support Dynamique Sombre / Clair (Dark / Light Mode)** : `ThemeProvider` permettant à l'utilisateur de basculer instantanément de mode avec persistance de préférence.
- **Parcours Utilisateur Fluide** : Écran d'accueil (`HomeScreen`), écran d'intégration (`OnboardingScreen`) et transitions soignées.
- **Code Modulaire & Maintenable** : Séparation stricte entre widgets de vue, modèles de données et fournisseurs d'état.

---

## 📂 Organisation des Sources (`src/`)

- [`pubspec.yaml`](./src/pubspec.yaml) : Définition du projet, des dépendances Flutter et des polices.
- [`lib/main.dart`](./src/lib/main.dart) : Point d'entrée de l'application, initialisation des thèmes et du provider.
- [`lib/themeProvider.dart`](./src/lib/themeProvider.dart) : Gestionnaire d'état du thème sombre/clair.
- [`ababacar_bara.dart`](./src/ababacar_bara.dart) : Script d'exercices et de cas d'usage métiers.

---

## 🚀 Exécution & Compilation

### Prérequis
- Flutter SDK (version 3.7+)
- Émulateur Android / iOS ou navigateur Web

### Commandes
```bash
# Récupération des dépendances
flutter pub get

# Lancement en mode debug
flutter run
```
