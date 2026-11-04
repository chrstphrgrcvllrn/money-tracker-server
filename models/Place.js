const mongoose = require("mongoose");
const userOwned = require("./plugins/userOwned");

// Images are stored as base64 data URLs (resized/compressed client-side
// before upload, see lib/image resize on the client). No object storage is
// configured for this app, so this keeps everything self-contained in Mongo;
// the size caps below keep a place document well under Mongo's 16MB limit.
const MAX_IMAGES = 6;
const MAX_IMAGE_LENGTH = 600_000; // ~450KB of binary once decoded
const MAX_LINKS = 10;
const MAX_LINK_LENGTH = 2000;

const placeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    // Free text ("123 Rizal St, Makati" or "that ramen place near work").
    // Kept as text rather than coordinates so no geocoding/maps API key is
    // needed — "Open in Maps" just does a text search.
    location: { type: String, default: "", trim: true },

    // Optional precise Google Maps link (e.g. a share link from the Maps app).
    // When present, "Open in Maps" uses this instead of a text search built
    // from `location`.
    mapLink: { type: String, default: "", trim: true, maxlength: 2000 },

    details: { type: String, default: "" },

    images: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (arr) => arr.length <= MAX_IMAGES,
          message: `A place can have at most ${MAX_IMAGES} images`,
        },
        {
          validator: (arr) => arr.every((s) => typeof s === "string" && s.length <= MAX_IMAGE_LENGTH),
          message: "Each image must be a reasonably small, resized image",
        },
      ],
    },

    // Video links (TikTok, YouTube, etc.), rendered as buttons on the client.
    // Opening one just follows the URL — the TikTok/YouTube apps intercept
    // their own domains via Universal/App Links on a phone, so no custom
    // deep-link scheme is needed here.
    links: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (arr) => arr.length <= MAX_LINKS,
          message: `A place can have at most ${MAX_LINKS} links`,
        },
        {
          validator: (arr) => arr.every((s) => typeof s === "string" && s.length <= MAX_LINK_LENGTH && /^https?:\/\//.test(s)),
          message: "Each link must be a valid http(s) URL",
        },
      ],
    },
  },
  { timestamps: true }
);

placeSchema.plugin(userOwned);

module.exports = mongoose.model("Place", placeSchema);
