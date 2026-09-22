import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text("Thème dynamique")),
      body: Center(
        child: ElevatedButton(
          onPressed: () => themeProvider.toggleTheme(),
          child: Text(themeProvider.themeMode == ThemeMode.dark
              ? "Passer en mode clair"
              : "Passer en mode sombre"),
        ),
      ),
    );
  }
}
