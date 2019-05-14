<!-- sirTrevor.vue -->
<template>
	<div class="sirTrevor">
		<form>
			<textarea ref="jInstance"></textarea>
		</form>
	</div>	
</template>
<script type="text/javascript">
	import SirTrevor from 'sir-trevor'

	export default {
		name:'sirTrevor',
		data () {
		return {
			msg: 'sir-trevor作为依赖库加入vue',
			editor: null,
		}
		},
		components: {
			SirTrevor
		},
		mounted() {
			this.init();
		},
		methods:{
			init(){
				this.editor = new SirTrevor.Editor({
					el: this.$refs.jInstance,
					defaultType: 'text',
					iconUrl: '../assets/icons/sir-trevor-icons.svg'
				});
			}
		}
	};

</script>
<style type="text/css">
	.jInstance{width: 100%;height: 100%;margin: 0 auto;font-size: 20px;}
</style>