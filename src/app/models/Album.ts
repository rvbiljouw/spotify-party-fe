import {Artist} from './Artist';
import {SpotifyImage} from "./SpotifyImage";

export class Album {
/*
  var id: String? = null
    var href: String? = null
    var name: String? = null
    var uri: String? = null
    var type: AlbumType? = null
    var urls: Map<String, String>? = emptyMap()
    var markets: List<String>? = emptyList()
    var images: List<Image>? = emptyList()
 */
id: string;
href: string;
name: string;
uri: string;
type: string;
urls: any;
markets: Array<String>;
images: Array<SpotifyImage>;
}
