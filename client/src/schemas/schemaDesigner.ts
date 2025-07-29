import { z } from "zod";

export const triggerSchema = z.array(
  z.object({
    type: z.string(),
    actions: z.array(
      z.object({
        type: z.string(),
        referenceId: z.string().optional(),
      })
    ),
    properties: z.any().nullable(),
  })
);

// [{ type: "onClick", actions: [{ type: "goToScreen", referenceId: "tade" }] }];

export const ObjectBaseSchema = z.object({
  id: z.string().uuid(),
  angle: z.number(),
  width: z.coerce.number().min(0),
  height: z.coerce.number().min(0),
  left: z.coerce.number(),
  top: z.coerce.number(),
  name: z.coerce.string(),
  type: z.string(),
  visible: z.boolean().optional(),
});

const InnerTextStyleSchema = z.object({
  color: z.string().optional(),
  fontStyle: z.enum(["normal", "italic"]).optional(),
  fontWeight: z.enum(["normal", "bold"]).optional(),
  fontSize: z.number().min(14).max(1000).optional(),
  underline: z.boolean().optional(),
  stroke: z.string().nullable().optional(),
  strokeWidth: z.number().nullable().optional(),
});

export const TextboxSchema = ObjectBaseSchema.extend({
  color: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.number().nullable().optional(),
  stroke: z.string().nullable().optional(),
  strokeWidth: z.number().nullable().optional(),
  settings: z.object({
    fontFamily: z.string().optional(),
    fontStyle: z.enum(["normal", "italic"]).optional(),
    fontWeight: z.enum(["normal", "bold"]).optional(),
    textAlign: z.enum(["left", "center", "right"]).optional(),
    fontSize: z.number().min(14).max(1000).optional(),
    content: z
      .array(
        z.object({
          text: z.string().optional(),
          type: z.enum(["dynamic"]).optional(),
          style: InnerTextStyleSchema.optional(),
        })
      )
      .optional(),
    underline: z.boolean().optional(),
  }),
  type: z.literal("IText"),
});

export const ShapesSchema = ObjectBaseSchema.extend({
  fill: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.number().nullable().optional(),
  stroke: z.string().nullable().optional(),
  strokeWidth: z.number().nullable().optional(),
  radius: z.number().nullable().optional(),
});

export const MultimediaSchema = ObjectBaseSchema.extend({
  fill: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.number().nullable().optional(),
  stroke: z.string().nullable().optional(),
  strokeWidth: z.number().nullable().optional(),
  settings: z
    .object({
      objectFit: z.enum(["contain", "cover", "fill"]).optional(),
      path: z.string().optional(),
      mediaType: z.enum(["video", "image", "playlist"]).optional(),
    })
    .optional(),
  type: z.literal("Multimedia"),
});

export const LineSchema = ObjectBaseSchema.extend({
  fill: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.number().nullable().optional(),
  stroke: z.string().nullable().optional(),
  strokeWidth: z.number().nullable().optional(),
  settings: z
    .object({
      startingPoint: z.string().optional(),
    })
    .optional(),
  type: z.literal("Line"),
});

export const ButtonSchema = ObjectBaseSchema.extend({
  settings: z
    .object({
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      borderRadius: z.number().int().min(0).optional(),
      borderStyle: z.string().optional(),
      borderWidth: z.number().int().min(0).optional(),
      buttonText: z.string().optional(),
      buttonTextColor: z.string().optional(),
      fontFamily: z.string().optional(),
      fontSize: z.number().int().min(0).optional(),
    })
    .optional(),
  triggers: triggerSchema.optional(),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.number().nullable().optional(),
  type: z.literal("Button"),
});

export const WeatherSchema = ObjectBaseSchema.extend({
  type: z.literal("Weather"),
  settings: z
    .object({
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      borderColor: z.string().optional(),
      borderWidth: z.number().int().min(0).optional(),
      borderRadius: z.number().int().min(0).optional(),
    })
    .optional(),
});

export const RSSFeedSchema = ObjectBaseSchema.extend({
  settings: z.object({
    tickerColor: z.string().optional(),
    newsColor: z.string().optional(),
    fontSize: z.number().int().min(0).optional(),
    fontFamily: z.string().optional(),
    animationDuration: z.number().optional(),
    animationType: z
      .enum(["scrollLeft", "scrollRight", "slideTop", "slideBottom"])
      .optional(),
    tickerText: z.string().optional(),
    tickerIcon: z.enum(["rss", "globe", "radio"]).optional(),
    tickerTextColor: z.string().optional(),
    newsTextColor: z.string().optional(),
    link: z.string().optional(),
  }),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.number().nullable().optional(),
  type: z.literal("RSSFeed"),
});

export const EmbedSchema = ObjectBaseSchema.extend({
  settings: z
    .object({
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      borderWidth: z.number().int().min(0).optional(),
      borderRadius: z.number().int().min(0).optional(),
      link: z.string().optional(),
    })
    .optional(),
  type: z.literal("Embed"),
});
export const QRCodeSchema = ObjectBaseSchema.extend({
  settings: z.object({
    text: z.string(),
    currentHeight: z.number().optional(), //TODO remove
    currentWidth: z.number().optional(), //TODO remove
    typeText: z.enum(["dynamic", "static"]).optional(),
    backgroundColor: z.string().optional(),
    foregroundColor: z.string().optional(),
    borderColor: z.string().nullable().optional(),
    borderWidth: z.number().nullable().optional(),
  }),
  opacity: z.number().min(0).max(1).optional(),
  shadow: z.number().nullable().optional(),
  type: z.literal("QRCode"),
});

export const ScreenObjectSchema = z.discriminatedUnion("type", [
  TextboxSchema,
  ShapesSchema.extend({ type: z.literal("Rect") }),
  ShapesSchema.extend({ type: z.literal("Triangle") }),
  ShapesSchema.extend({ type: z.literal("Ellipse") }),
  LineSchema,
  MultimediaSchema,
  RSSFeedSchema,
  QRCodeSchema,
  EmbedSchema,
  ButtonSchema,
  WeatherSchema,
]);

export const ScreenSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().max(100).optional(),
    background: z.string(),
    default: z.boolean(),
    onIdleReturn: z
      .object({
        id: z.string().optional(),
        time: z.string().optional(),
      })
      .optional(),
    orientation: z.enum(["landscape", "portrait"]),
    resolution: z.object({
      width: z.number(),
      height: z.number(),
    }),
    objects: z.array(ScreenObjectSchema),
  })
  .required();

export const DesignConfigurationSchema = z.object({
  screens: z.array(ScreenSchema),
});

export const DesignerSchema = z.object({
  ID: z.string().uuid(),
  Name: z.string().trim().max(100).min(1),
  CompanyID: z.string().uuid(),
  Configuration: DesignConfigurationSchema,
});

export type ObjectBase = z.infer<typeof ObjectBaseSchema>;
export type InnerTextStyle = z.infer<typeof InnerTextStyleSchema>;
export type Textbox = z.infer<typeof TextboxSchema>;
export type Shape = z.infer<typeof ShapesSchema>;
export type Line = z.infer<typeof LineSchema>;
export type Multimedia = z.infer<typeof MultimediaSchema>;
export type Weather = z.infer<typeof WeatherSchema>;
export type RSSFeed = z.infer<typeof RSSFeedSchema>;
export type Embed = z.infer<typeof EmbedSchema>;
export type QRCode = z.infer<typeof QRCodeSchema>;
export type ButtonObject = z.infer<typeof ButtonSchema>;
export type ScreenObject = z.infer<typeof ScreenObjectSchema>;
export type Screen = z.infer<typeof ScreenSchema>;
export type DesignConfiguration = z.infer<typeof DesignConfigurationSchema>;
export type Design = z.infer<typeof DesignerSchema>;
