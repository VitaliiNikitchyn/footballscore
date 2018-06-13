const Koa = require("koa");
const Router = require("koa-router");
const KoaBody = require("koa-body");
const jquery = require("jquery");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


const app = new Koa();
const router = new Router();

app
   .use(KoaBody())
   .use(router.routes())
   .use(router.allowedMethods());

app.listen(process.env.PORT || 3000);


router.get("/result/ru", async (ctx, next) => {
	var resp = [];
	await JSDOM.fromURL("http://www.sport-express.ru/live/football/", {

	}).then(dom => {
		const $ = jquery(dom.window);
		var league;
		$("div.football").find("div.results_border div").each((i, element) => {
			if ($(element).hasClass("toggled_results")) {
				league = {};
				league.name = $(element).text().trim();
				league.events = [];					
				resp.push(league);
			} else if ($(element).hasClass("white_block")) {
				$(element).find("table.table_score tbody tr").each((j, event) => {
					const status = $(event).find("td.ph_20 div.t_left").text().trim();

					var newEvent = {
						time: $(event).find("td.ph_20 div.fs_20").text().trim(),
						firstTeam: $(event).find("td.t_right span").text().trim(),
						score: $(event).find("td.fs_22 span").text().trim(),
						secondTeam: $(event).find("td.t_left span").text().trim(),
						status: status,
						isLive: (status === "1-й тайм" ||
								status === "2-й тайм" ||
								status === "Перерыв" ||
								status === "Дополнительное время") ? true : false
					};
					league.events.push(newEvent);
				});				
			}
		});
		ctx.body = resp;
	});
});