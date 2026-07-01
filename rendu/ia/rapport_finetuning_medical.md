# Rapport de Fine-Tuning (Modèle Médical Expérimental)

## Lien Colab
Le notebook d'entraînement est disponible à l'adresse suivante :
[Lien vers le Notebook Google Colab](https://colab.research.google.com/drive/1WgLBIpCU_VTZ-3PkmhMMgg9OeirCjVIJ?usp=sharing)

## Métriques d'Entraînement

L'entraînement a été réalisé sur 100 étapes (ce qui correspond à une fraction d'epoch pour accélérer le POC).

| Step | Training Loss |
|------|---------------|
| 10   | 10.559961     |
| 20   | 8.408079      |
| 30   | 7.176503      |
| 40   | 6.794599      |
| 50   | 6.736793      |
| 60   | 6.672852      |
| 70   | 6.537183      |
| 80   | 6.586666      |
| 90   | 6.453170      |
| 100  | 6.363887      |

**Loss Finale :** 6.363887

*Conclusion :* On observe une convergence claire avec une perte (loss) qui diminue progressivement de 10.55 à 6.36, indiquant que le modèle assimile les spécificités du dataset médical.
