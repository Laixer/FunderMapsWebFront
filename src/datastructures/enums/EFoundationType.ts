
// https://github.com/Laixer/FunderMaps/blob/develop/src/FunderMaps.Core/Types/FoundationType.cs
export enum EFoundationType {
  /// <summary>
  ///     Wood.
  /// </summary>
  Wood = 0,

  /// <summary>
  ///     Wood foundation accoring to Amsterdam.
  /// </summary>
  WoodAmsterdam = 1,

  /// <summary>
  ///     Wood foundation accoring to Rotterdam.
  /// </summary>
  WoodRotterdam = 2,

  /// <summary>
  ///     Concrete.
  /// </summary>
  Concrete = 3,

  /// <summary>
  ///     No pile.
  /// </summary>
  NoPile = 4,

  /// <summary>
  ///     No pile and no masonry.
  /// </summary>
  NoPileMasonry = 5,

  /// <summary>
  ///     No pile strips.
  /// </summary>
  NoPileStrips = 6,

  /// <summary>
  ///     No pile and no bearing floor.
  /// </summary>
  NoPileBearingFloor = 7,

  /// <summary>
  ///     No pile and no concrete floor.
  /// </summary>
  NoPileConcreteFloor = 8,

  /// <summary>
  ///     No pile and no slit.
  /// </summary>
  NoPileSlit = 9,

  /// <summary>
  ///     Wood charger.
  /// </summary>
  WoodCharger = 10,

  /// <summary>
  ///     Weighted pile.
  /// </summary>
  WeightedPile = 11,

  /// <summary>
  ///     Combined.
  /// </summary>
  Combined = 12,

  /// <summary>
  ///     Steel pile.
  /// </summary>
  SteelPile = 13,

  /// <summary>
  ///     Other.
  /// </summary>
  Other = 14,

  /// <summary>
  ///     Wood foundation accoring to Amsterdam or Rotterdam.
  /// </summary>
  WoodRotterdamAmsterdam = 15,

  /// <summary>
  ///     Wood foundation accoring to Rotterdam with an arch.
  /// </summary>
  WoodRotterdamArch = 16,

  /// <summary>
  ///     Wood foundation accoring to Amsterdam with an arch.
  /// </summary>
  WoodAmsterdamArch = 17,
}

/**
 * Labels for user friendly presentation
 */
export const EFoundationTypeLabels: Map<EFoundationType, string> = new Map([
  [EFoundationType.Wood, "Houtenpaal fundering"],
  [EFoundationType.WoodAmsterdam, "Houtenpaal (Amsterdamse) fundering"],
  [EFoundationType.WoodRotterdam, "Houtenpaal (Rotterdamse) fundering"],
  [EFoundationType.Concrete, "Betonpaal fundering"],
  [EFoundationType.NoPile, "Ondiepe fundering"],
  [EFoundationType.NoPileMasonry, "Ondiepe fundering, gemetseld"],
  [EFoundationType.NoPileStrips, "Ondiepe fundering, stroken"],
  [EFoundationType.NoPileBearingFloor, "Ondiepe fundering, plaatfundering"],
  [EFoundationType.NoPileConcreteFloor, "Ondiepe fundering, betonvloer"],
  [EFoundationType.NoPileSlit, "Ondiepe fundering, slieten"],
  [EFoundationType.WoodCharger, "Houten paal met betonoplanger"],
  [EFoundationType.WeightedPile, "Verzwaardepuntpaal"],
  [EFoundationType.Combined, "Gecombineerde fundering"],
  [EFoundationType.SteelPile, "Stalenbuispaal"],
  [EFoundationType.Other, "Overig"],
  [EFoundationType.WoodRotterdamAmsterdam, "Houten (Rotterdamse/Amsterdamse) paalfundering"],
  [EFoundationType.WoodRotterdamArch, "Houten (Rotterdamse) paalfundering met spaarboog"],
  [EFoundationType.WoodAmsterdamArch, "Houten (Amsterdamse) paalfundering met spaarboog"]
]);
