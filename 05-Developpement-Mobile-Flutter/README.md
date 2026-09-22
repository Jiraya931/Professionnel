# Développement Mobile Multiplateforme (Flutter & Dart)

> **Projet de Développement d'Application — Master 1 RESI**  
> **Auteur** : Ababacar Ousmane Niang  
> **Stack Technique** : Flutter SDK, Dart, Provider (State Management), Material Design 3

---

## Présentation Technique du Projet

Ce projet présente l'architecture logicielle et l'implémentation d'une application mobile multiplateforme développée avec le framework **Flutter** de Google.

### Principes d'Ingénierie Logicielle :
- **Gestion d'État Réactive** : Utilisation du patron de conception `provider` pour garantir un découplage strict entre la couche de données et l'arbre de widgets.
- **Thématisation Dynamique** : `ThemeProvider` assurant la bascule instantanée entre thème sombre et thème clair avec conservation des préférences d'affichage.
- **Parcours Utilisateur & Ergonomie** : Conception d'écrans dédiés (`HomeScreen`, `OnboardingScreen`) avec transitions fluides respectant les spécifications Material Design 3.
- **Structure Modulaire** : Découpage maintenable séparant composants graphiques, modèles et contrôleurs.

---

## Organisation des Sources (`src/`)

- [`pubspec.yaml`](./src/pubspec.yaml) : Manifeste du projet, gestion des dépendances et déclaration des polices.
- [`lib/main.dart`](./src/lib/main.dart) : Point d'entrée de l'application, initialisation des thèmes et injection du fournisseur d'état.
- [`lib/themeProvider.dart`](./src/lib/themeProvider.dart) : Gestionnaire d'état du cycle de vie des thèmes visuels.
- [`ababacar_bara.dart`](./src/ababacar_bara.dart) : Script de validation d'algorithmes et de logique métier.

---

## Procédure d'Exécution & Compilation

### Prérequis
- Flutter SDK (version 3.7 ou supérieure)
- Android SDK / Xcode ou environnement d'exécution Web (Chrome)

### Commandes
```bash
# Installation des dépendances
flutter pub get

# Lancement en environnement local de développement
flutter run
```
