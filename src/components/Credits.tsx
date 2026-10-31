/** Credit for the found photograph shown on every page. */
export function Credits() {
  return (
    <p className="on-ground mt-4 px-5 text-small text-on-ground-soft md:px-10 xl:px-13">
      Photograph of the Brașov sign on Tâmpa by Husky,{" "}
      <a
        href="https://commons.wikimedia.org/wiki/File:Brasov_hollywood_sign.jpg"
        className="underline underline-offset-2 hover:text-on-ground"
      >
        CC BY 3.0 via Wikimedia Commons
      </a>
      , cropped and shown in greyscale.
    </p>
  );
}
